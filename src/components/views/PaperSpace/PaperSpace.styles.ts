import styled from "@emotion/styled";

export const Container = styled.div`
  /* border: 1px solid red; */

  overflow: hidden;
  position: relative;
  flex: 1;

  display: flex;
  flex-direction: column;
`;

export const Wrapper = styled.div`
  position: relative;

  flex: 1;
  display: flex;
`;

/* this causes everything inside this container to be a bit blurry: */
/* left: 50%;
  transform: translateX(calc(-50% + 0.5px)); */
/* left: calc((100vw-${({ offset }) => offset}px) / 2) px; */
export const Float = styled.div<{ widthOffset: number }>`
  /* border: 2px solid red; */

  z-index: 5;
  position: absolute;

  left: calc((100vw - ${({ widthOffset }) => widthOffset}px) / 2);
  /* left: calc(100vw - 10px); */

  /* padding-top: 0.5rem; */
  /* margin: 0.5rem; */
  margin-top: 0.5rem;

  max-width: calc(100vw - 1rem);

  /* margin: 0 2rem; */

  /* padding-right: 0; */

  /* top: 0; */
  /* left: 0; */
  /* margin: 1rem; */

  /* height: 100%; */
  /* width: 100%; */

  display: flex;

  justify-content: center;
  align-items: center;
  gap: 1rem;
`;
