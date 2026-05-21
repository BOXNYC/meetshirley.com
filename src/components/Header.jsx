import { Container, Row, Col } from 'react-bootstrap';

const date = new Date(),
      m = date.getMonth()+1,
      d = date.getDate(),
      y = date.getFullYear(),
      release = [8, 11, 2023],
      [month, day, year] = release,
      released = ( m >= month && d >= day && y >= year )

function Header() {
  return (<>
    <Container id="header">
      <Row className='h-100'>
          <Col xs="6" sm="6" md="4" id='meet-shirley' className='d-flex align-items-end'>
            <h1 className='' data-sprite="logo">Meet Shirley</h1>
          </Col>
          <Col xs="6" sm="6" md="8" id='get-tickets' className='text-end d-flex align-items-center flex-column justify-content-center'>
            <a target="_blank" href='https://www.mgm.com/titles/landscape-with-invisible-hand/'>
              {!released && (<picture id='cto-not-released'>
                <source media="(min-width:767px)" srcSet='/get-tickets-sm.png' />
                <img src='/get-tickets-xs.png' />
              </picture>)}
              {released && (<picture id='cto-released'>
                <source media="(min-width:767px)" srcSet='/get-tickets-sm.png' />
                <img src='/get-tickets-xs.png' />
              </picture>)}
            </a>
          </Col>
      </Row>
    </Container>
  </>)
}

export default Header
