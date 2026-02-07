import AgoraRTC, {
    IAgoraRTCClient,
    IAgoraRTCRemoteUser,
    IMicrophoneAudioTrack,
    UID
} from 'agora-rtc-sdk-ng';
import { AIDenoiserExtension, IAIDenoiserProcessor } from 'agora-extension-ai-denoiser';

// Agora Configuration
// App ID should be set via environment variable for security
const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID;

// Event callback types
type UserPublishedCallback = (user: IAgoraRTCRemoteUser) => void;
type UserLeftCallback = (user: IAgoraRTCRemoteUser) => void;
type ConnectionStateCallback = (state: string) => void;

class AgoraService {
    private client: IAgoraRTCClient | null = null;
    private localAudioTrack: IMicrophoneAudioTrack | null = null;
    private currentChannelName: string | null = null;
    private currentUid: UID | null = null;
    private isConnected: boolean = false;
    private connectionAttempts: number = 0;
    private readonly MAX_CONNECTION_ATTEMPTS = 3;

    // AI Denoiser extension
    private denoiserExtension: AIDenoiserExtension | null = null;
    private denoiserProcessor: IAIDenoiserProcessor | null = null;

    // Recording properties
    private audioContext: AudioContext | null = null;
    private mediaRecorder: MediaRecorder | null = null;
    private recordingDestination: MediaStreamAudioDestinationNode | null = null;
    private recordedChunks: Blob[] = [];
    private localStreamSource: MediaStreamAudioSourceNode | null = null;
    private remoteStreamSources: Map<UID, MediaStreamAudioSourceNode> = new Map();


    // Event callbacks
    private onUserPublished: UserPublishedCallback | null = null;
    private onUserLeft: UserLeftCallback | null = null;
    private onConnectionStateChange: ConnectionStateCallback | null = null;

    /**
     * Initialize Agora client
     */
    async initialize() {
        if (this.client) {
            console.log('⚠️ Agora client already initialized');
            return;
        }

        console.log('🎙️ Initializing Agora client...');

        // Create Agora client with RTC mode and VP8 codec
        this.client = AgoraRTC.createClient({
            mode: 'rtc',
            codec: 'vp8'
        });

        // Initialize and Register AI Denoiser
        try {
            console.log('🛡️ Initializing AI Denoiser extension...');
            this.denoiserExtension = new AIDenoiserExtension({
                assetsPath: '/wasm/denoiser'
            });
            AgoraRTC.registerExtensions([this.denoiserExtension]);

            this.denoiserProcessor = this.denoiserExtension.createProcessor();

            // Enable by default
            await this.denoiserProcessor.enable();
            console.log('✅ AI Denoiser initialized and enabled');
        } catch (error) {
            console.error('❌ Failed to initialize AI Denoiser:', error);
        }

        // Set up event listeners
        this.setupEventListeners();

        console.log('✅ Agora client initialized');
    }

    /**
     * Set up Agora event listeners
     */
    private setupEventListeners() {
        if (!this.client) return;

        // User published audio
        this.client.on('user-published', async (user, mediaType) => {
            console.log(`👤 User published ${mediaType}:`, user.uid);

            if (mediaType === 'audio') {
                try {
                    // Subscribe to remote user's audio
                    await this.client!.subscribe(user, mediaType);
                    console.log('✅ Subscribed to remote audio');

                    // Play remote audio
                    user.audioTrack?.play();
                    console.log('🔊 Playing remote audio');

                    // Mix into recording if active
                    if (this.audioContext && this.recordingDestination && user.audioTrack) {
                        this.addRemoteTrackToRecording(user.uid, user.audioTrack);
                    }


                    // Notify callback
                    if (this.onUserPublished) {
                        this.onUserPublished(user);
                    }
                } catch (error) {
                    console.error('❌ Failed to subscribe to remote user:', error);
                }
            }
        });

        // User unpublished
        this.client.on('user-unpublished', (user, mediaType) => {
            console.log(`👤 User unpublished ${mediaType}:`, user.uid);
        });

        // User left channel
        this.client.on('user-left', (user, reason) => {
            console.log(`👋 User left channel:`, user.uid, 'Reason:', reason);

            if (this.onUserLeft) {
                this.onUserLeft(user);
            }
        });

        // Connection state changed
        this.client.on('connection-state-change', (curState, prevState, reason) => {
            console.log(`🔗 Connection state: ${prevState} → ${curState}`, reason);

            // Update internal connection flag
            this.isConnected = curState === 'CONNECTED';

            if (curState === 'DISCONNECTED') {
                console.error(`❌ Agora connection ${curState}:`, reason);
                this.connectionAttempts++;
            } else if (curState === 'CONNECTED') {
                this.connectionAttempts = 0; // Reset on successful connection
            }

            if (this.onConnectionStateChange) {
                this.onConnectionStateChange(curState);
            }
        });

        // Network quality
        this.client.on('network-quality', (stats) => {
            // Log network quality (optional)
            // console.log('📊 Network quality:', stats);
        });
    }

    /**
     * Join an Agora channel
     * @param channelName - Channel name (e.g., call_123)
     * @param token - Agora token from backend
     * @param uid - User ID (use user's ID from your system)
     */
    async joinChannel(channelName: string, token: string | null, uid: string | number): Promise<void> {
        try {
            if (!this.client) {
                await this.initialize();
            }

            // Validate inputs
            if (!channelName || channelName.trim() === '') {
                throw new Error('Channel name cannot be empty');
            }

            if (this.connectionAttempts >= this.MAX_CONNECTION_ATTEMPTS) {
                throw new Error(`Maximum connection attempts (${this.MAX_CONNECTION_ATTEMPTS}) exceeded. Please try again later.`);
            }

            console.log(`📞 Joining Agora channel: ${channelName} (Attempt ${this.connectionAttempts + 1}/${this.MAX_CONNECTION_ATTEMPTS})`);

            // Join the channel
            this.currentUid = await this.client!.join(
                AGORA_APP_ID,
                channelName,
                token, // Can be null for testing (not recommended for production)
                uid
            );

            this.currentChannelName = channelName;
            this.isConnected = true;
            this.connectionAttempts = 0; // Reset on success
            console.log(`✅ Joined channel as UID: ${this.currentUid}`);

            // Create and publish local audio track
            await this.publishLocalAudio();

        } catch (error: any) {
            this.connectionAttempts++;
            console.error('❌ Failed to join Agora channel:', error);

            // Provide more specific error messages
            let errorMessage = `Failed to join channel: ${error.message}`;

            if (error.code === 'INVALID_PARAMS') {
                errorMessage = 'Invalid channel parameters. Please check your configuration.';
            } else if (error.code === 'NOT_SUPPORTED') {
                errorMessage = 'Your browser does not support Agora RTC.';
            } else if (error.code === 'PERMISSION_DENIED') {
                errorMessage = 'Microphone permission denied. Please allow microphone access.';
            }

            throw new Error(errorMessage);
        }
    }

    /**
     * Create and publish local audio track
     */
    private async publishLocalAudio(): Promise<void> {
        try {
            console.log('🎤 Creating local audio track...');

            // Create microphone audio track
            this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
                encoderConfig: 'speech_standard', // Optimized for voice
                AEC: true,  // Acoustic Echo Cancellation
                ANS: true,  // Automatic Noise Suppression
                AGC: true,  // Automatic Gain Control
            });

            console.log('✅ Local audio track created');

            // Pipe through denoiser if available
            if (this.denoiserProcessor) {
                try {
                    console.log('🛡️ Piping audio through AI Denoiser...');
                    this.localAudioTrack.pipe(this.denoiserProcessor).pipe(this.localAudioTrack.processorDestination);
                    console.log('✅ Audio piped through AI Denoiser');
                } catch (error) {
                    console.error('❌ Failed to pipe audio through denoiser:', error);
                }
            }

            // Publish to channel
            await this.client!.publish([this.localAudioTrack]);
            console.log('✅ Published local audio to channel');

        } catch (error: any) {
            console.error('❌ Failed to publish local audio:', error);
            throw new Error(`Failed to publish audio: ${error.message}`);
        }
    }

    /**
     * Leave the current channel and cleanup
     */
    async leaveChannel(): Promise<void> {
        try {
            console.log('👋 Leaving Agora channel...');

            // Close local audio track
            if (this.localAudioTrack) {
                this.localAudioTrack.close();
                this.localAudioTrack = null;
                console.log('✅ Local audio track closed');
            }

            // Leave channel
            if (this.client) {
                await this.client.leave();
                console.log('✅ Left Agora channel');
            }

            this.currentChannelName = null;
            this.currentUid = null;
            this.isConnected = false;

        } catch (error: any) {
            console.error('❌ Error leaving channel:', error);
            throw error;
        }
    }

    /**
     * Toggle mute/unmute local audio
     * @returns New mute state (true = muted, false = unmuted)
     */
    async toggleMute(): Promise<boolean> {
        if (!this.localAudioTrack) {
            console.warn('⚠️ No local audio track to mute');
            return false;
        }

        const currentlyEnabled = this.localAudioTrack.enabled;
        await this.localAudioTrack.setEnabled(!currentlyEnabled);

        const isMuted = !this.localAudioTrack.enabled;
        console.log(`🔇 Audio ${isMuted ? 'muted' : 'unmuted'}`);

        return isMuted;
    }

    /**
     * Set mute state explicitly
     */
    async setMuted(muted: boolean): Promise<void> {
        if (!this.localAudioTrack) {
            console.warn('⚠️ No local audio track');
            return;
        }

        await this.localAudioTrack.setEnabled(!muted);
        console.log(`🔇 Audio ${muted ? 'muted' : 'unmuted'}`);
    }

    /**
     * Get current mute state
     */
    isMuted(): boolean {
        return this.localAudioTrack ? !this.localAudioTrack.enabled : false;
    }

    /**
     * Set event callbacks
     */
    setEventCallbacks(callbacks: {
        onUserPublished?: UserPublishedCallback;
        onUserLeft?: UserLeftCallback;
        onConnectionStateChange?: ConnectionStateCallback;
    }) {
        this.onUserPublished = callbacks.onUserPublished || null;
        this.onUserLeft = callbacks.onUserLeft || null;
        this.onConnectionStateChange = callbacks.onConnectionStateChange || null;
    }

    /**
     * Cleanup and destroy client
     */
    async destroy(): Promise<void> {
        await this.leaveChannel();

        if (this.client) {
            this.client.removeAllListeners();
            this.client = null;
            console.log('✅ Agora client destroyed');
        }
    }

    /**
     * Get current channel info
     */
    getCurrentChannel(): { channelName: string | null; uid: UID | null } {
        return {
            channelName: this.currentChannelName,
            uid: this.currentUid
        };
    }

    /**
     * Check if currently connected to a channel
     */
    isChannelConnected(): boolean {
        return this.isConnected && this.currentChannelName !== null;
    }

    /**
     * Get connection retry count
     */
    getConnectionAttempts(): number {
        return this.connectionAttempts;
    }

    /**
     * Reset connection attempts (can be called after successful recovery)
     */
    resetConnectionAttempts(): void {
        this.connectionAttempts = 0;
    }

    // ==========================================
    // RECORDING IMPLEMENTATION
    // ==========================================

    private async initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.recordingDestination = this.audioContext.createMediaStreamDestination();
        }
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
            console.log('🔊 AudioContext resumed');
        }
    }

    /**
     * Start recording the call (Local + Remote Audio)
     */
    async startRecording(): Promise<void> {
        try {
            console.log('🎙️ Starting call recording logic...');
            await this.initAudioContext();
            this.recordedChunks = [];

            if (!this.recordingDestination) {
                throw new Error('Recording destination not initialized');
            }

            console.log('🔊 AudioContext state:', this.audioContext?.state);

            // 1. Add Local Audio
            if (this.localAudioTrack) {
                const localMediaStream = new MediaStream([this.localAudioTrack.getMediaStreamTrack()]);
                this.localStreamSource = this.audioContext!.createMediaStreamSource(localMediaStream);
                this.localStreamSource.connect(this.recordingDestination!);
                console.log('✅ Local audio added to recording mix');
            } else {
                console.warn('⚠️ No local audio track found for recording');
            }

            // 2. Add Existing Remote Users
            if (this.client) {
                const remoteUsers = this.client.remoteUsers;
                console.log(`🔍 Checking ${remoteUsers.length} existing remote users for recording`);
                remoteUsers.forEach(user => {
                    if (user.hasAudio && user.audioTrack) {
                        this.addRemoteTrackToRecording(user.uid, user.audioTrack);
                    }
                });
            }

            // 3. Setup MediaRecorder
            const mixedStream = this.recordingDestination.stream;
            console.log(`📊 Mixed stream has ${mixedStream.getAudioTracks().length} tracks`);

            // Check for supported mime types
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';

            console.log(`📼 Using MIME type for recording: ${mimeType}`);
            this.mediaRecorder = new MediaRecorder(mixedStream, { mimeType });

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                    console.log(`📥 Received recording chunk: ${event.data.size} bytes. Total chunks: ${this.recordedChunks.length}`);
                }
            };

            this.mediaRecorder.onstart = () => console.log('🟢 MediaRecorder started');
            this.mediaRecorder.onerror = (err) => console.error('🔴 MediaRecorder error:', err);

            this.mediaRecorder.start(1000); // Collect chunks every second
            console.log('✅ MediaRecorder.start() called');

        } catch (error) {
            console.error('❌ Failed to start recording:', error);
        }
    }

    /**
     * Stop recording and return the Blob
     */
    async stopRecording(): Promise<Blob | null> {
        return new Promise((resolve) => {
            if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
                console.warn('⚠️ No active recording to stop');
                resolve(null);
                return;
            }

            console.log('⏹️ Stopping recording...');

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
                console.log(`✅ Recording finished. Size: ${blob.size} bytes`);

                // Cleanup
                this.cleanupRecording();
                resolve(blob);
            };

            this.mediaRecorder.stop();
        });
    }

    private addRemoteTrackToRecording(uid: UID, audioTrack: any) {
        try {
            if (!this.audioContext || !this.recordingDestination) return;

            if (this.remoteStreamSources.has(uid)) {
                console.log(`ℹ️ Remote user ${uid} already in mix`);
                return;
            }

            const track = audioTrack.getMediaStreamTrack();
            const stream = new MediaStream([track]);
            const source = this.audioContext.createMediaStreamSource(stream);

            source.connect(this.recordingDestination);
            this.remoteStreamSources.set(uid, source);
            console.log(`✅ Remote user ${uid} added to recording mix`);
        } catch (error) {
            console.error('❌ Failed to add remote track to recording:', error);
        }
    }

    private cleanupRecording() {
        this.recordedChunks = [];

        // Disconnect sources
        if (this.localStreamSource) {
            this.localStreamSource.disconnect();
            this.localStreamSource = null;
        }

        this.remoteStreamSources.forEach(source => source.disconnect());
        this.remoteStreamSources.clear();

        this.mediaRecorder = null;
        // Keep AudioContext alive if needed, or close it? 
        // Typically keep it for the session or close if desired.
        // this.audioContext?.close(); 
        // this.audioContext = null;
    }
}

// Export singleton instance
export const agoraService = new AgoraService();
export default agoraService;

