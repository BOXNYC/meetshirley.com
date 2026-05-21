import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
  return (
    <Container id="footer">
        <Row className='pt-3 pb-2'>
            <Col className='text-end'>
                <span data-sprite="hashtag">#LANDSCAPEMOVIE</span><br />
                <span>
                  <a href="https://www.facebook.com/landscapemovie" data-sprite="fb"></a>
                  <a href="https://www.instagram.com/landscapemovie/" data-sprite="ig"></a>
                  <a href="https://twitter.com/landscapemovie" data-sprite="tw"></a>
                  <a href="https://www.threads.net/@landscapemovie" data-sprite="td"></a>
                </span>
            </Col>
            <Col>
                <span data-sprite="rated-r">Rated R</span><br />
                <small className='text-uppercase'>©2023 Metro-Goldwyn-Mayer Pictures Inc. <span className='nowrap'>All Rights Reserved.</span></small>
            </Col>
        </Row>
    </Container>
  )
}

export default Footer
