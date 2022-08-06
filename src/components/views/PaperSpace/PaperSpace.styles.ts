import styled from "@emotion/styled";

export const Container = styled.div`
  /* border: 1px solid red; */

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

export const Float = styled.div`
  z-index: 5;
  position: absolute;

  padding: 1rem;
  padding-right: 0;

  top: 0;
  left: 0;
  /* margin: 1rem; */

  height: 100%;

  display: flex;
  gap: 1rem;
`;
