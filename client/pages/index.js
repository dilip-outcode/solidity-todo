import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import WrongNetworkMessage from '../components/WrongNetworkMessage'
import ConnectWalletButton from '../components/ConnectWalletButton'
import TodoList from '../components/TodoList'
import { TasksContractAddress } from '../config'
import TasksAbi from '../../backend/build/contracts/TasksContract.json'

export default function Home() {

  const [correctNetwork, setCorrectNetwork] = useState(false)
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const [currentAccount, setCurrentAccount] = useState('')
  const [input, setInput] = useState('')
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    connectWallet()
  }, [])

  // Calls Metamask to connect wallet on clicking Connect Wallet button
  const connectWallet = async () => {
    try {
      const { ethereum } = window
      if (!ethereum) {
        console.log(" metamask not detected");
      } else {
        let chainId = await ethereum.request({ method: 'eth_chainId'})
        const sepoliaChainId = "0x" + Number(11155111).toString(16)

        if(chainId !== sepoliaChainId) {
          alert("You are not connected to Sepolia testnet")
          setCorrectNetwork(false)
          return
        } else {
          setCorrectNetwork(true)
          getAllTasks()
        }

        const accounts = await ethereum.request({ method: 'eth_requestAccounts'})
        setIsUserLoggedIn(true)
        setCurrentAccount(accounts[0])
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Just gets all the tasks from the contract
  const getAllTasks = async () => {
    try {
      const { ethereum } = window
      if(ethereum) {
        const provider = new ethers.BrowserProvider(ethereum)
        const signer  = await provider.getSigner()
        const taskContract = new ethers.Contract(
          TasksContractAddress,
          TasksAbi.abi,
          signer
        )
        const allTasks = await taskContract.getMyTasks()
        setTasks(allTasks)
        
      }else {
        console.log("ethereum object not found");
      }
    } catch (error) {
      console.log("error in get tasks == ", error);
    }
  }

  // Add tasks from front-end onto the blockchain
  const addTask = async e => {
    e.preventDefault()  //avoid refresh

    let task = {
      taskText: input,
      isDeleted: false
    }

    try {
      const { ethereum } = window
      if(ethereum) {
        console.log(" providers == ", ethers);
        // const provider = new ethers.providers.Web3Provider(ethereum);
        const provider = new ethers.BrowserProvider(ethereum)
        const signer  = await provider.getSigner()
        const taskContract = new ethers.Contract(
          TasksContractAddress,
          TasksAbi.abi,
          signer
        )

        const addTaskTransaction = await taskContract.addTask(task.taskText, task.isDeleted)
        // await addTaskTransaction.wait()
        setTasks([...tasks, task])
        setInput('')
        console.log(" task added successfully");
      }else {
        console.log("ethereum object not found");
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Remove tasks from front-end by filtering it out on our "back-end" / blockchain smart contract
  const deleteTask = async (key) => {
    console.log("i am here");
    try {
      const { ethereum } = window
      if(ethereum) {
        const provider = new ethers.BrowserProvider(ethereum)
        const signer  = await provider.getSigner()
        const taskContract = new ethers.Contract(
          TasksContractAddress,
          TasksAbi.abi,
          signer
        )
        const deleteTskTxn = await taskContract.deleteTask(key, true)
        await deleteTskTxn.wait()
        const allTasks = await taskContract.getMyTasks()
        setTasks(allTasks)
        
      }else {
        console.log("ethereum object not found");
      }
    } catch (error) {
      console.log("error in delete tasks == ", error);
    }
  }

  return (
    <div className='bg-[#97b5fe] h-screen w-screen flex justify-center py-6'>
      {!isUserLoggedIn ? <ConnectWalletButton connectWallet={connectWallet}/> :
        correctNetwork ? <TodoList tasks={tasks} input={input} setInput={setInput} addTask={addTask} deleteTask={deleteTask}/> : <WrongNetworkMessage />}
    </div>
  )
}

