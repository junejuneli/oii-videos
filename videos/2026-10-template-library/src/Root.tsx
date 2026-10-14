import { Composition } from "remotion";
import { Main, MAIN_DURATION } from "./Main";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TemplateLibrary"
      component={Main}
      durationInFrames={MAIN_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
