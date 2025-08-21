import {useEffect, useRef, useState} from "react";

export default function Receiver() {
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    useEffect(() => {
        // Create a WebSocket connection to the signaling server
        const socket = new WebSocket("ws://localhost:8080");

        // When connection is open, register this client as "receiver"
        socket.onopen = () => {
            socket.send(JSON.stringify({type: "receiver"}));
        };

        // Listen for messages from the signaling server
        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);

            // If we receive an "offer" from the sender:
            if (message.type == "createOffer") {
                // Create a new RTCPeerConnection (represents the WebRTC connection)
                const pc = new RTCPeerConnection();
                setPeerConnection(pc);
                // Set the sender's offer (SDP) as the remote description
                pc.setRemoteDescription(message.sdp);

                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.send(JSON.stringify({type: "iceCandidate", candidate: event.candidate}));
                    }
                };

                pc.ontrack = (event) => {
                    console.log("Track: ", event.track);
                    if (videoRef.current) {
                        videoRef.current.srcObject = new MediaStream([event.track]);
                        videoRef.current.play();
                    }
                };
                // Generate an SDP "answer" describing our capabilities
                const answer = await pc.createAnswer();

                // Set it as our local description
                await pc.setLocalDescription(answer);

                // Send the answer back to the sender via signaling server
                socket.send(
                    JSON.stringify({
                        type: "createAnswer",
                        sdp: pc.localDescription,
                    })
                );
            } else if (message.type == "iceCandidate") {
                peerConnection?.addIceCandidate(message.candidate);
            }
        };
    }, [peerConnection]);

    return (
        <div>
            <h1>Receiver</h1>
            <video ref={videoRef}></video>
        </div>
    );
}
