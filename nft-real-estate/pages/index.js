import { Box } from '@chakra-ui/react'
import Head from 'next/head'
import Image from 'next/image'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import Footer from '../components/Footer'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    // insert Navbar
    <Box>
    <Navbar />
    <Hero />
    <Features />
    <Footer />
    </Box>
  )
}
