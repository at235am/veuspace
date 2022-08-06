import { Sidebar } from "../../Sidebar";
import { PaperSpace } from "../../PaperSpace";

// contexts:
import { PaperStateProvider } from "../../../contexts/PaperContext";
import { Wrapper, Float } from "./PaperSpace.styles";

export const PaperSpaceArea = () => {
  return (
    <PaperStateProvider>
      <Wrapper>
        <Float>
          <Sidebar />
        </Float>
        <PaperSpace />
      </Wrapper>
    </PaperStateProvider>
  );
};

// export const PaperSpaceArea = () => {
//   return <div>sdf</div>;
// };
