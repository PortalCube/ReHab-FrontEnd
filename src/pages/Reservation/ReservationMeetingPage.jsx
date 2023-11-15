import styled from "styled-components";

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RTCClient } from "../../librarys/webrtc/rtc-client.js";
import { AudioRecorder } from "../../librarys/webrtc/rtc-recorder.js";
import dayjs from "dayjs";
import { ImExit } from "react-icons/im";

const Container = styled.div`
  height: 100%;
`;

const VideoContainer = styled.div`
  width: 100vw;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
`;

const VideoWrapper = styled.div`
  width: 50vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #1f1f1f;
`;

const Description = styled.p`
  margin-top: -64px;
  font-size: 24px;
  text-align: center;
  color: white;
  text-shadow: 0px 2px 2px #0000007f;
`;

const Status = styled.div`
  top: 50%;
  position: absolute;
  transform: translateY(-50%);
  color: white;
  text-align: center;
  font-size: 3.5vw;
  font-weight: 600;
`;
const StatusDescription = styled.p`
  margin-top: 8px;
  color: white;
  text-align: center;
  font-size: 1.2vw;
  font-weight: 400;
  white-space: pre-wrap;
`;

const Icon = styled(ImExit)`
  width: 24px;
  height: 24px;
`;

const Button = styled.button`
  top: 72px;
  left: 16px;
  padding: 8px 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  position: absolute;
  font-size: 16px;
  background-color: #f51643;
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #ba0b2e;
  }
`;

const ReservationMeetingPage = () => {
  const navigate = useNavigate();
  const clientVideo = useRef(null);
  const remoteVideo = useRef(null);
  const { uuid } = useParams();
  const [status, setStatus] = useState("연결되지 않음");
  const [statusDescription, setStatusDescription] = useState(
    "아직 상대방이 접속하지 않았어요.\n상대방이 접속할 때까지 기다려주세요.",
  );
  const [peer, setPeer] = useState(new RTCClient());
  const [recorder, setRecorder] = useState(new AudioRecorder());

  useEffect(() => {
    const unload = () => {
      peer.destory();
    };

    peer.addEventListener("stream", onStream);

    peer.addEventListener("disconnect", () => {
      recorder.stop();
      setStatus("연결 종료");
      setStatusDescription("비대면 진료가 종료되었어요.");
    });

    peer.addEventListener("open", () => {
      setStatus("");
      setStatusDescription("");
    });

    recorder.addEventListener("complete", (event) => {
      const blob = event.detail.data;
      const sampleRate = event.detail.sampleRate;
    });

    window.addEventListener("beforeunload", unload);

    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      peer.connect(uuid, "user", stream);

      clientVideo.current.volume = 0;
      clientVideo.current.srcObject = stream;
    })();

    return () => {
      peer.destory();
      window.removeEventListener("beforeunload", unload);
    };
  }, []);

  async function onStream(event) {
    const stream = event.detail;

    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    recorder.start(audioStream);
    remoteVideo.current.srcObject = stream;
  }

  return (
    <Container>
      <VideoContainer>
        <VideoWrapper>
          <Video ref={clientVideo} autoPlay />
          <Description>클라이언트</Description>
        </VideoWrapper>
        <VideoWrapper>
          <Video ref={remoteVideo} autoPlay />
          <Status>
            {status}
            <StatusDescription>{statusDescription}</StatusDescription>
          </Status>
          <Description>상대방</Description>
        </VideoWrapper>
      </VideoContainer>
      <Button onClick={() => navigate("/dashboard")}>
        <Icon />
        나가기
      </Button>
    </Container>
  );
};

export default ReservationMeetingPage;
