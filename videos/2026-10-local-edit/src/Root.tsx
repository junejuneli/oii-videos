import { Composition } from "remotion";
import { Landscape, MAIN_DURATION } from "./Main";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="LocalEdit" component={Landscape} durationInFrames={MAIN_DURATION} fps={30} width={1920} height={1080} />
  </>
);
