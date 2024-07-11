# vesting Token
steps to setup the code:

# step1:
-Clone or Copy the Github Repository.</br>
-open it in any IDE(like VScode).</br>


# step2:
-Run the followind command in backend and frontend folder separately to install the node module of the project:
    "npm i"

# step3:
-After the succesfull installation of node modules. create the ".env" file in frontend.</br>

-In the frontend in ".env" file paste the following code:</br>
VITE_VESTING_CONTRACT_ADDRESS = 'vesting contract address'<br>
VITE_TOKEN_CONTRACT_ADDRESS = 'token contract address'</br>


# step4:
Run the following command in terminal</br>
-To complie the contract: "npx hardhat compile"</br>
-To deploy the contract: "npx hardhat ignition deploy ./ignition/modules/Lock.js"</br>

After the successfull deployment you'll get the contract address. Copy the contract address and paste it in ".env" file in frontend folder.

# step5:
-Now in the frontend directory run the following command:</br>
"npm run dev"</br>

After this the Dapp is ready to run on local host.


