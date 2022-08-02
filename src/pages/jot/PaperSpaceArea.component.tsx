import { Sidebar } from "../../components/Sidebar";
import { PaperSpace } from "../../components/PaperSpace";

// contexts:
import { PaperStateProvider } from "../../contexts/PaperContext";
import { Wrapper, Float } from "./PaperSpacePage.styles";

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
