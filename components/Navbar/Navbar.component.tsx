import { Logo } from "../Logo";
import { Container, List, StretchedItem, Item } from "./Navbar.styles";
import { NavbarItem } from "./NavbarItem";

export const links = [
  // { name: "Home", link: "/", order: 0, color: "#428ae8", icon: MdMap },
  { name: "Jot", link: "/jot", order: 0, color: "#19b28e" },
  {
    name: "Register",
    link: "/register",
    order: 1,
    color: "#fee257",
    // icon: RiAuctionFill,
  },
  {
    name: "Create",
    link: "/create",
    order: 3,
    color: "#f99155",
    // icon: MdShoppingBasket,
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
