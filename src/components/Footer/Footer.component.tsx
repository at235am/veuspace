import { Container, Content, List, Item } from "./Footer.styles";

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
