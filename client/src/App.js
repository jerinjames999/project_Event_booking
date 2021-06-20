import "./App.css";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";

import AuthPage from "./Pages/Auth";
import EventsPage from "./Pages/Events";
import BookingsPage from "./Pages/Bookings";
import MainNavigation from "./components/Navigation/MainNavigation";
import React from "react";

function App() {
  return (
    <BrowserRouter>
      {/* browserrouter can only have one child So use React.Fragment which is an empty shell which only acts to make a single element*/}
      <React.Fragment>
        <MainNavigation />
        {/* This main is a normal HTML element. not needed */}
        <main className="main-content">
          <Switch>
            {/* So only the first matching of all these alternatives will run. If we need to use Redirect wrap it in Switch */}
            <Redirect from="/" to="/auth" exact />
            <Route path="/auth" component={AuthPage} />
            <Route path="/events" component={EventsPage} />
            <Route path="/bookings" component={BookingsPage} />
          </Switch>
        </main>
      </React.Fragment>
    </BrowserRouter>
  );
}

export default App;
