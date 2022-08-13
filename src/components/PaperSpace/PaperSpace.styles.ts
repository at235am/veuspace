import styled from "@emotion/styled";

export const Container = styled.div`
  /* border: 1px solid red; */

  /** overflow hidden is necessary to prevent a bug on mobile where the resize observer won't fire */
  overflow: hidden;
  position: relative;
  touch-action: none;
  background-color: #333;
  background-color: ${({ theme }) => theme.colors.surface.B00};

  /* max-width: 100vw; */
  /* max-height: 100vh; */

  position: relative;
  flex: 1;

  display: flex;
  flex-direction: column;
`;

export const Canvas = styled.canvas`
  position: absolute;
`;

export const Popup = styled.pre`
  position: absolute;
  top: 0;
  right: 0;
  padding: 1rem;
`;
