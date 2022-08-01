// libary:
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

// nextjs:
import type { NextPage } from "next";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";

import { contentCenter } from "../styles/content-centerer";
import { useThemeController } from "../styles/theme/Theme.context";

const Container = styled.div`
  /* border: 1px solid red; */

  width: 100%;

  flex: 1;
  /* padding: 1rem; */

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

const Content = styled.div`
  ${({ theme }) => contentCenter(theme)};

  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const WelcomeMessage = styled.h1`
  font-size: 4rem;
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

const T = styled.span`
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
const X = styled.span`
  font-size: inherit;
  font-weight: 500;

  color: #fff;
`;

const Home = () => {
  const { toggleBetweenLightAndDarkMode } = useThemeController();
  return (
    <Container id="index">
      <Content>
        <WelcomeMessage>
          <T>
            veu<X>space</X>
          </T>
        </WelcomeMessage>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa at
          laboriosam numquam veniam voluptates corporis ipsum, facere illum
          eveniet dolores deserunt! Odio aut, nisi praesentium eaque ipsam
          exercitationem aspernatur eligendi ratione delectus officia maiores et
          adipisci culpa, nostrum iure molestias provident itaque ab ipsum
          veniam sit assumenda numquam. Nobis aliquid necessitatibus, officiis
          illo ullam tempora dolorum asperiores itaque? Rem aliquam
          exercitationem labore repellendus voluptatem ipsa debitis eveniet
          sequi, veniam tenetur laborum laboriosam voluptate, ullam officiis
          incidunt numquam et omnis ducimus aperiam? Doloribus ratione debitis
          laborum accusamus veniam ullam a itaque quaerat molestiae.
          Consequuntur nam hic doloribus voluptate, quasi tenetur temporibus.
        </p>
        <p>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quis ipsa
          recusandae nesciunt beatae obcaecati. Excepturi cumque consequatur
          laudantium dolore alias cupiditate inventore, eligendi soluta
          voluptatem reprehenderit quaerat? Voluptatibus aperiam ex dignissimos
          beatae, nostrum id minus fuga repellat! Obcaecati et ea rem ipsam a,
          voluptates perferendis unde deleniti hic eaque sapiente quod, at
          praesentium exercitationem nisi quo quisquam consequatur quas cumque
          molestiae facilis! Necessitatibus obcaecati id aperiam unde,
          consequuntur adipisci odit.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita,
          ratione hic. Doloremque magnam libero deleniti cum reiciendis itaque
          laborum, sunt atque vero sapiente repellendus? Voluptas ea debitis
          optio neque voluptatibus corporis autem a pariatur, illum quae eum.
          Nam culpa maxime odio ipsam quos facilis, quibusdam architecto ad
          repellendus tempore, beatae iure hic aperiam libero optio quae vero,
          quam aliquid eum nostrum dignissimos mollitia possimus minus. Neque
          beatae repellendus inventore illo velit esse, illum veritatis, quae
          architecto, quam ut! Nulla eaque culpa nemo assumenda repudiandae
          cupiditate veniam fugiat sequi tempore, similique, eum voluptate
          necessitatibus ex distinctio accusantium, deleniti suscipit non libero
          aperiam reiciendis exercitationem alias fuga. Hic deleniti officia
          obcaecati doloremque!
        </p>
        <p>
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Et dolores
          suscipit corporis aperiam ipsa temporibus excepturi praesentium aut.
          Atque amet ipsum vel quam itaque harum excepturi odio cum? Nesciunt,
          tempore.
        </p>
      </Content>
    </Container>
  );
};

export default Home;
