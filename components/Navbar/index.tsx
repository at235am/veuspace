import styled from "@emotion/styled";

// icons:
import { MdMap, MdShoppingBasket, MdPlusOne, MdCheckBox } from "react-icons/md";
import { RiAuctionFill } from "react-icons/ri";
import { GiStoneSphere } from "react-icons/gi";

import NavbarItem from "./NavbarItem";
import Logo from "../Logo";

import { contentCenter } from "../../styles/content-centerer";
// import Logo from "./Logo";

const Container = styled.nav`
  height: 5rem;

  background-color: ${({ theme }) => theme.colors.background.dark};
  background-color: transparent;

  display: flex;
  justify-content: center;
`;

const List = styled.ul`
  /* border: 2px dashed orange; */

  ${({ theme }) => contentCenter(theme)}

  display: flex;
  /* justify-content: space-between; */
  align-items: center;
  gap: 1rem;
`;

const Item = styled.li`
  color: white;
`;

const StretchedItem = styled(Item)`
  flex: 1;
`;

const links = [
  // { name: "Home", link: "/", order: 0, color: "#428ae8", icon: MdMap },
  { name: "Jot", link: "/jot", order: 0, color: "#19b28e", icon: MdMap },
  {
    name: "Register",
    link: "/register",
    order: 1,
    color: "#fee257",
    icon: RiAuctionFill,
  },
  {
    name: "Create",
    link: "/create",
    order: 3,
    color: "#f99155",
    icon: MdShoppingBasket,
  },
];

const Navbar = () => {
  return (
    <Container>
      <List>
        <StretchedItem>{<Logo />}</StretchedItem>

        {links.map((link) => (
          <Item key={link.name}>
            <NavbarItem
              key={link.name}
              name={link.name}
              // color={link.color}
              // icon={link.icon}
              link={link.link}
            />
          </Item>
        ))}
      </List>
    </Container>
  );
};

export default Navbar;
