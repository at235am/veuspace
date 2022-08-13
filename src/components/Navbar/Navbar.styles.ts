import styled from "@emotion/styled";

// import
import { contentCenter } from "../../styles/content-centerer";

// icons:

export const Container = styled.nav`
  height: 5rem;

  background-color: ${({ theme }) => theme.colors.background.D20};
  background-color: transparent;

  display: flex;
  justify-content: center;
`;

export const List = styled.ul`
  /* border: 2px dashed orange; */

  ${({ theme }) => contentCenter(theme)}

  display: flex;
  /* justify-content: space-between; */
  align-items: center;
  gap: 1rem;
`;

export const Item = styled.li`
  color: white;
`;

export const StretchedItem = styled(Item)`
  flex: 1;
`;
