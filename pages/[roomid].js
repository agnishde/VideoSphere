import { useEffect } from "react"

import { useSocket } from "@/context/socket";
import usePeer from "@/hooks/usePeer";
import useMediaStream from "@/hooks/useMediaStream";
import usePlayer from "@/hooks/usePlayer";

import Player from "@/component/Player";

const Room = () => {
    const socket = useSocket()
    const { peer, myId } = usePeer();
    const { stream } = useMediaStream()
    const {players, setPlayers} = usePlayer()

    useEffect(() => {
        if (!socket || !peer || !stream) return;
        const handleUserConnected = (newUser) => {
            console.log(`user connected in room with userId ${newUser}`);

            const call = peer.call(newUser, stream)

            call.on("stream", (incomingStream) => {
                console.log(`incoming stream from ${newUser}`);
                setPlayers((prev) => ({
                    ...prev,
                    [newUser]: {
                      url: incomingStream,
                      muted: true,
                      playing: true,
                    }
                  }))
            })
        }
        socket.on('user-connected', handleUserConnected)

        return () => {
            socket.off('user-connected', handleUserConnected)
        }
    }, [peer, setPlayers, socket, stream])


    useEffect(() => {
        if (!peer || !stream) return;
        peer.on("call", (call) => {
            const { peer: callerId } = call;
            call.answer(stream);

            call.on("stream", (incomingStream) => {
                console.log(`incoming stream from ${callerId}`)
                setPlayers((prev) => ({
                    ...prev,
                    [callerId]: {
                      url: incomingStream,
                      muted: true,
                      playing: true
                    }
                  }))
            })
        })
    }, [peer, setPlayers, stream])


    useEffect(() => {
        if (!stream || !myId) return;
        console.log(`setting my stream ${myId}`);
        setPlayers((prev) => ({
          ...prev,
          [myId]: {
            url: stream,
            muted: true,
            playing: true,
          },
        }));
      }, [myId, setPlayers, stream]);



    return (<div>
        {Object.keys(players).map((playerId)=>
        {
            const {url,muted,playing} = players[playerId]
            return <Player key={playerId} url={url} muted ={muted} playing={playing} />
        })}
        
    </div>)
};

export default Room;