import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import { AUTH_TOKEN } from '../constants'


class Header extends Component {
  /**
   * You first retrieve the authToken from local storage. If authToken is not available, the submit-button won't be rendered any more. That way you make sure that only authenticated users can create new links!
   * You're also adding a second button to the right of the Header that users can use to login and logout.
   */
  render() {
    // First, retrieve the authtoken from local storage; We'll use that to conditionally render parts of the header.
    const authToken = localStorage.getItem(AUTH_TOKEN)
    return (
      <div className="flex pa1 justify-between nowrap orange">
        <div className="flex flex-fixed black">
          <div className="fw7 mr1">Cracker News</div>
          <Link to="/" className="ml1 no-underline black">
            new
        </Link>
          <div className="ml1">|</div>
          <Link to="/search" className="ml1 no-underline black">
            search
        </Link>
          {authToken && (
            <div className="flex">
              <div className="ml1">|</div>
              <Link to="/create" className="ml1 no-underline black">
                submit
            </Link>
            </div>
          )}
        </div>
        <div className="flex flex-fixed">
          {authToken ? (
            <div
              className="ml1 pointer black"
              onClick={() => {
                localStorage.removeItem(AUTH_TOKEN)
                this.props.history.push(`/`)
              }}
            >
              logout
          </div>
          ) : (
              <Link to="/login" className="ml1 no-underline black">
                login
          </Link>
            )}
        </div>
      </div>
    )
  }
}

export default withRouter(Header);