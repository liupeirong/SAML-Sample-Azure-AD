# Azure AD SAML sample app

This is a simple node.js app generated using [express-generator](https://expressjs.com/en/starter/generator.html).
 It's refactored to enable SAML in Azure AD for the purpose of simulating existing enterprise SAML applications
 so that we can understand and test how web apps built with modern UI framework and OAuth integrate with SAML
 without having to stand up an often complicated brown-field enterprise application.

This app doesn't have local identity provider, it entirely relies on Azure AD to host users and their credentials.
 Once logged in, the index page `/` renders a simple UI that displays the user's ID and username.
 The `/users` route returns the json format of the logged in user as [defined here](app.js#L32).

The code that enables SAML are marked in multiple sections in [app.js like this](app.js#L7).

## Key concepts about SAML for someone familiar with OAuth

* SAML in enterprise applications is similar to the concept of "sign in with your Google or Facebook account" in social apps. It externalizes authentation to an identity provider (IDP) so that users can log in to different applications with a single identity.
* Unlike OAuth, SAML doesn't have the notion of tokens, rather, the IDP will issue a SAML assertion, typically in XML, once the user is logged in. You can see this assertion by calling `/users` once logged in.
* Unlike OAuth, SAML doesn't do authorization, doesn't have the concept of scopes. It only does authentication.
* The app and the IDP need to agree on a few key pieces of information:
  * What to use as the primary idenfier of the user, for example, email or upn.
  * A certificate that let's the IDP encrypt the assertion and the app decrypt it.
  * The app needs to know which URLs the IDP provides to log in and log out. The IDP needs to know which app URL to callback once user is logged in.
* [passport.js](https://www.passportjs.org/packages/passport-saml/) stores the logged in user info on the server side. The browser has a session cookie that identifies the user if not expired.
* To call back to the client that accesses this web app after the user logs in, we rely on what is called a [RelayState](https://medium.com/@tou_sfdx/understand-and-use-the-relaystate-parameter-in-saml-sso-with-salesforce-c5131d635a1c) to [store the callback URL from the client](app.js#L69) and [redirect to that URL once authenticated](app.js#L75).

## Run this application

1. Register this SAML application in Azure AD.
   * Go to Azure AD portal, __Enterprise Applications__, __+ New application__,__+ Create your own application__, select __integrate any other application you don't find in the gallery (Non-gallery).
   * Follow [this doc](https://learn.microsoft.com/en-us/azure/active-directory/manage-apps/add-application-portal-setup-sso) to enable single-sign-on with SAML.
   * The values you configure in the above steps will be used in the `.env` file below. Especially the __Identifier (Entity ID)__ is the value for _AZURE_AD_ENTERPRISE_APP_SAML_Identifier_.
   ![SAML SSO](https://learn.microsoft.com/en-us/azure/active-directory/saas-apps/common/edit-urls.png)
2. (Optionally) create certificates for https.
3. Copy [.sample.env](./.sample.env) to `.env` in the project root folder.
4. In the project root folder, run the following:

```bash
npm install
npm start
```

By default, the app runs on `https://localhost:5000`. Refer to this [Microsoft Teams sample app](TODO) to see how to integrate this SAML app with Teams.

> Note that this sample does not yet implement how to log the user out or how to reauthenticate when the assertion expires.
