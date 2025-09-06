import React from "react";
import styled from "styled-components";

const Hamburguer = ({ onClick, isOpen }) => {
  return (
    <Wrapper onClick={onClick} className={isOpen ? "open" : ""}>
      <span />
      <span />
      <span />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 24px; /* ANTES: 35px */
  height: 18px; /* ANTES: 25px */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;

  span {
    display: block;
    height: 3px; /* ANTES: 4px */
    width: 100%; /* ANTES: 80% con un margin-left extraño, 100% es más común */
    background: #101e4fff;
    border-radius: 2px;
    transition: all 0.3s ease;
    /* Se eliminó margin-left: 40% para un centrado correcto */
  }

  &.open span:nth-child(1) {
    /* Los valores de translate deben reducirse también */
    transform: rotate(45deg) translate(6px, 6px); /* ANTES: translate(5px, 5px) */
  }
  &.open span:nth-child(2) {
    opacity: 0;
  }
  &.open span:nth-child(3) {
    /* Los valores de translate deben reducirse también */
    transform: rotate(-45deg) translate(5px, -5px); /* ANTES: translate(10px, -10px) */
  }
`;

export default Hamburguer;
