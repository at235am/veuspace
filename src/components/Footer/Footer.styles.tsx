import styled from "@emotion/styled";
import { contentCenter } from "../../styles/content-centerer";

export const Container = styled.footer`
  height: 5rem;
  /* padding: 1rem 0; */
  background-color: ${({ theme }) => theme.colors.background.D10};
  /* background-color: transparent; */

  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Content = styled.div`
  ${({ theme }) => contentCenter(theme)};
  /* color: black; */
`;

export const List = styled.ul`
  display: flex;
  flex-direction: row;
  gap: 1rem;
`;

export const Item = styled.li`
  /* flex: 1; */
`;
