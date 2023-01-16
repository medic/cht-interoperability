# Interoperability
This project implements a Loss to Follow Up (LTFU) workflow system for CHIS based on [OpenHIE LTFU Guide](https://wiki.ohie.org/display/SUB/Use+Case+Summary:+Request+Community+Based+Follow-Up)

## Get Started

1. Run `./startup.sh init` to start-up the docker containers on the first run or after calling `./startup.sh destroy`. Use `./startup.sh up` for subsequent runs after calling `init` without calling `destroy`.

1. The default User username for OpenHIM is `interop@openhim.org` and password is `interop-password`. The default Client username is `interop-client` and password is `interop-password`.

1. `./startup.sh down` or `./startup.sh destroy` to shutdown the servers.

1. Visit http://localhost:9000 and login with the following credentials email: `interop@openhim.org` and password: `interop-password`.

1. Once logged in, visit http://localhost:9000/#!/mediators and select the only mediator with the `Name` 'Loss to Follow Up Mediator'.

1. Select the green `+` button to the right of the default channel to add the mediator.

1. You can test the mediator by running `curl -X GET http://localhost:5001/mediator -H "Authorization: Basic $(echo -n interop-client:interop-password | base64)"`. You should get the following response `{"status": "success" }`

1. If the curl request fails, visit http://localhost:9000/#!/clients and click on the icon the red arrow points to in the image below.
![](./docs/images/bad-client-screen.png) If everything is success full you should see this ![](./docs/images/good-client-screen.png)