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
  width: 35px;
  height: 25px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  margin-left: 4rem;

  span {
    display: block;
    height: 4px;
    width: 80%;
    background: #fff;
    border-radius: 2px;
    transition: all 0.3s ease;
    margin-left: 70%;
  }

  &.open span:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
  }
  &.open span:nth-child(2) {
    opacity: 0;
  }
  &.open span:nth-child(3) {
    transform: rotate(-45deg) translate(10px, -10px);
  }
`;

export default Hamburguer;
