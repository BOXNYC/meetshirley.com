import { Container, Navbar, Nav, NavItem, NavLink } from 'react-bootstrap'
import { Outlet } from "react-router-dom";
import Header  from './Header.jsx'
import Footer  from './Footer.jsx'

function Layout() {
    return (
        <Container id='main' className='h-100 d-flex flex-column'>
            <Header />
            <Outlet />
            <Footer />
        </Container>
    );
}

export default Layout