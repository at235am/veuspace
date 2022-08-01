// libary:
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

export const Container = styled.div`
  /* border: 1px solid red; */

  width: 100%;

  flex: 1;
  padding: 1rem;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;

  /* pointer-events: none allows the user to interact with the star background */
  pointer-events: none;
  & > * {
    pointer-events: all;
  }
`;

export const WelcomeMessage = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
`;

const animatedText = keyframes`
  from{
    background-position: 0%;
  }
  to{
    background-position: 100%; 
  }
`;

export const T = styled.span`
  line-height: 10px;
  font-size: inherit;
  font-weight: 700;

  background-image: linear-gradient(
    to right,
    #19b28e,
    #fee257,
    #ff3939,
    #217aff
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;

  background-size: 300%;
  background-position: -100%;

  animation: ${animatedText} 5s infinite alternate-reverse;
`;

// exclude the gradient:
export const X = styled.span`
  font-size: inherit;
  font-weight: 400;
  letter-spacing: -2px;

  color: #fff;
`;
