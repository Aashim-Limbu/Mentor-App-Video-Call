import {useEffect, useState} from "react";

export default function Sender() {
    // Keep track of WebSocket connection (to signaling server)
    const [socket, setSocket] = useState<null | WebSocket>(null);

    useEffect(() => {
        // Create WebSocket connection to signaling server
        const ws = new WebSocket("ws://localhost:8080");
        setSocket(ws);

        // When connected, register this client as "sender"
        ws.onopen = () => {
            ws.send(JSON.stringify({type: "sender"}));
        };
    }, []);

    async function startSendingVideo() {
        if (!socket) return;

        // Create a new RTCPeerConnection (represents WebRTC connection)
        const peerConnection = new RTCPeerConnection();

        peerConnection.onnegotiationneeded = async () => {
            console.log("Negotiation Needed");
            // Create an SDP offer (describes codecs, media info, etc.)
            const offer = await peerConnection.createOffer();

            // Set this as the local description (our own connection info)
            await peerConnection.setLocalDescription(offer);

            // Send offer to signaling server → forwarded to receiver
            socket.send(JSON.stringify({type: "createOffer", sdp: peerConnection.localDescription}));
        };

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.send(JSON.stringify({type: "iceCandidate", candidate: event.candidate}));
            }
        };

        // Handle messages from signaling server (e.g., when receiver replies)
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            // If receiver sends back an SDP "answer", apply it as remote description
            if (data.type == "createAnswer") {
                peerConnection.setRemoteDescription(data.sdp);
            } else if (data.type == "iceCandidate") {
                peerConnection.addIceCandidate(data.candidate);
            }
        };
        // Share Video
        const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
        // Share Screen
        // const stream = await navigator.mediaDevices.getDisplayMedia({video: true, audio: false});

        peerConnection.addTrack(stream.getVideoTracks()[0]);
    }

    return (
        <div>
            <h1 className="mb-20">Sender</h1>

            {/* Button to trigger sending video (starting WebRTC negotiation) */}
            <button
                className="p-2 px-4 bg-indigo-600 hover:bg-indigo-500 cursor-pointer rounded-md"
                onClick={startSendingVideo}
            >
                Send Video
            </button>
        </div>
    );
}
