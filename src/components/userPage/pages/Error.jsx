import { Link } from "react-router-dom";

export default function Error(){
    return(
       <>
   {/* Single Page Header start */}
  
  {/* Single Page Header End */}
  {/* 404 Start */}
  <section className="page_404">
  <div className="container">
    <div className="row justify-content-center">
      <div className="col-md-10 text-center">
        <div className="four_zero_four_bg">
          <h1 className="text-center">Server Not Responding</h1>
        </div>
        <div className="contant_box_404">
          <h3 className="h2">Look like you're lost</h3>
          <p>the page you are looking for not avaible!</p>
          <Link to="/" className="link_404">
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  </div>
</section>

<a
  href="#"
  className="btn btn-primary border-3 border-primary rounded-circle back-to-top"
  style={{ display: 'none' }}
>
  <i className="fa fa-arrow-up" />
</a>
</>
    )
}