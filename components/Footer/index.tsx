import styled from "@emotion/styled";
import { contentCenter } from "../../styles/content-centerer";

const Container = styled.footer`
  height: 5rem;
  /* padding: 1rem 0; */
  background-color: ${({ theme }) => theme.colors.background.dark};
  /* background-color: transparent; */

  display: flex;
  justify-content: center;
  align-items: center;
`;

const Content = styled.div`
  ${({ theme }) => contentCenter(theme)};
  /* color: black; */
`;

const List = styled.ul`
  display: flex;
  flex-direction: row;
  gap: 1rem;
`;

const Item = styled.li`
  /* flex: 1; */
`;

const Footer = () => {
  return (
    <Container>
      <Content>
        <List>
          <Item>Contact</Item>
          <Item>Discord</Item>

          <Item>Changelog</Item>
          <Item>Github</Item>

          <Item>Privacy</Item>
          <Item>Terms </Item>
        </List>
      </Content>
    </Container>
  );
};

export default Footer;
