# Project Setup and Launch

Follow the steps below to clone, configure, and run the project.

## Step 1: Clone the Repository

```bash
git clone <repository URL>
cd <project directory name>
```

## Step 2: Install Dependencies

Ensure that Node.js and npm are installed. Then run:

```bash
npm install
```

## Step 3: Configure Environment Variables

Create a `.env` file in the project's root directory and add the following lines:

```
PRIVATE_KEY=
API_URL=
CONTRACT_ADDRESS=
```
Fill in these variables with the appropriate values.

## Step 4: Compile the Project

Run the command to compile smart contracts:

```bash
npx hardhat compile
```

After this, check the ABI file to ensure the compilation was successful.

## Step 5: Start a Local Blockchain

Start the local blockchain server by running:

```bash
npx hardhat node
```

## Step 6: Deploy the Contract

In a new terminal, run the command to deploy the contract (make sure to specify the correct network):

```bash
npx hardhat run --network ganache ./scripts/deploy.js
```

## Step 7: Run the Project

After successful deployment, run the following command to start the project:

```bash
node index.js
```

Open the website in your browser at:

```
http://localhost:3000/