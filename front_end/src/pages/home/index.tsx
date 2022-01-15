import React from 'react'
import { Header } from '../../components/Header';
import { Container } from "@mui/material";
import { Main } from './components/Main';

const Home = () => {
    return (
      <div>
        <Header />
        <Container maxWidth="lg">
            <Main />
        </Container>
      </div>
    );
}

export default Home;
