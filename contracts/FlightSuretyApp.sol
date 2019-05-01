pragma solidity >=0.4.25;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */
contract FlightSuretyApp {
    using SafeMath for uint256; // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    address private contractOwner;          // Account used to deploy contract

    struct Airlines {
        bool isRegistered;
        address accountAddress;
        string airlinesName;
    }

    uint8 private PERCENTAGE_OF_AUTHORIZERS = 50;
    uint8 private INITIAL_AUTHORIZER_COUNT = 5;

    address[] registeredAirlineList = new address[](0); 
    mapping(address => Airlines) registeredAirlines; 
    mapping(address => address[]) registrationAuthorizers; // Airlines that have authorized the registration


    FlightSuretyData flightSuretyData;

    event contractLog(string logMsg, address airline, string flight, uint256 timestamp, uint8 status, uint8 index);

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
         // Modify to call data contract's status
        require(true, "Contract is currently not operational");  
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner" ); 
        _;
    }

    modifier requireAlreadyNotRegistered(address newAirlines)
    {
        require(!registeredAirlines[newAirlines].isRegistered, "Airlines is already registered"  );
        _;
    }

    function toString(address x) internal pure returns (string memory) {
        bytes memory b = new bytes(20);
        for (uint i = 0; i < 20; i++)
            b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
        return string(b);
    }

    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/

    /**
    * @dev Contract constructor
    *
    */
    constructor
                                (   address dataContract,
                                    string memory firstAirlines,
                                    address firstAirlineAddress 
                                ) 
                                public 
    {
        contractOwner = msg.sender;
        flightSuretyData = FlightSuretyData(dataContract);

        registeredAirlineList.push(firstAirlineAddress);
        registeredAirlines[firstAirlineAddress]  =  Airlines({
            isRegistered: true,
            accountAddress: firstAirlineAddress,
            airlinesName: firstAirlines
        });
        //success = true;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function isAirlineRegistered(address airlineAddress) external view  returns (bool status){
        status = registeredAirlines[airlineAddress].isRegistered;
    }

    function isOperational() 
                            external 
                            view 
                            returns(bool) 
    {
        return flightSuretyData.isOperational();  // Modify to call data contract's status
    }

        /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            public
                            requireContractOwner 
    {
        flightSuretyData.setOperatingStatus(mode);
    }

    function getContractOwner  ( ) 
                            external view returns (address)
                            
    {
        return contractOwner;
    }

    function getRegisteredAirlines( ) external view  returns (address[] memory _registeredAirlineList){
        return registeredAirlineList;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

  
   /**
    * @dev Add an airline to the registration queue
    *
    */   
    /////////////////////////

    function registerAirline
                            (   
                                string  airlinesName,
                                address newAirlines // airlines that needs to be registered
                            )
                            external
                           requireIsOperational
                           requireAlreadyNotRegistered (newAirlines)  // require airlines is not already registered
                           returns( int votesNeeded)
    {
        // if the # of registered airlines is less than 5, one of the registered airlines can register another airlines
        bool authorized = false;
        votesNeeded = 0;
        //success = false;
        address[] memory authorizers =  registrationAuthorizers[newAirlines];

        if(registeredAirlineList.length <= INITIAL_AUTHORIZER_COUNT){

           //// emit contractLog("in registerAirline lt initialAuthCount ",  newAirlines,  "",  0, uint8(registeredAirlineList.length),  INITIAL_AUTHORIZER_COUNT);

            if(registeredAirlines[tx.origin].isRegistered)
            {
                authorized = true;
            }
        }
        else { // half of the registered airlines should authorize the registration

           emit contractLog("in registerAirline gt initialAuthCount ",  newAirlines,  "",  0, 
           uint8(registeredAirlineList.length),  INITIAL_AUTHORIZER_COUNT);

           if(authorizers.length >= registeredAirlineList.length.mul(PERCENTAGE_OF_AUTHORIZERS).div(100)){
                authorized = true;               
           }
           else{
               registrationAuthorizers[newAirlines].push(tx.origin);
               votesNeeded  = int(registeredAirlineList.length.mul(PERCENTAGE_OF_AUTHORIZERS).div(100) - (authorizers.length+1));
           emit contractLog("in registerAirline gt initialAuthCount ",  newAirlines,  "",  0, 
                uint8(registeredAirlineList.length), uint8(authorizers.length+1));

           }

        } 
        if(authorized){
            registeredAirlineList.push(newAirlines);
            registeredAirlines[newAirlines]  =  Airlines({
                isRegistered: true,
                accountAddress: newAirlines,
                airlinesName: airlinesName
            });
            //success = true;
           //emit contractLog("in registerAirline before calling data ",  newAirlines,  "",  0, 
           //uint8(registeredAirlineList.length),  uint8(authorizers.length+1));
            flightSuretyData.registerAirline(airlinesName, newAirlines);
          // emit contractLog("in registerAirline after calling data",  newAirlines,  "",  0, 
           //uint8(registeredAirlineList.length),  uint8(authorizers.length+1));

            registrationAuthorizers[newAirlines] = new address[](0);
           //emit RegisteredAirline(airlinesName, newAirlines);
            votesNeeded = 0;
        }
            return votesNeeded;
    }



    /////////////////////////

    function fund
                            (   
                            )
                            public
                            payable
                            returns (uint)
    {
        return flightSuretyData.fund.value(msg.value)();
    }
    function getRegisteredAirlineFund(address airline ) external view returns (uint){
        return flightSuretyData.getRegisteredAirlineFund(airline);
    }

    function buy
                            ( 
                               address passenger,
                                address airlines,
                                string flight,
                                uint256 timestamp
                            )
                            external
                            payable
                            returns (uint256)
    {
        return flightSuretyData.buy.value(msg.value)(passenger, airlines, flight, timestamp);
    }

    function getInsuranceAmount(address passenger, address airlines, string flight, uint256 timestamp) external  returns (uint256)
    {
        return flightSuretyData.getInsuranceAmount(passenger, airlines, flight, timestamp);
    }

    function getCreditedInsuranceAmount(address passenger, address airlines, string flight, uint256 timestamp) external  returns (uint256)
    {
        return flightSuretyData.getCreditedInsuranceAmount(passenger, airlines, flight, timestamp);
    }


    function creditInsurees
                                (
                                address airlines,
                                string flight,
                                uint256 timestamp,
                                uint256 suretyAmtMultiplier,
                                uint256 suretyAmtDivider
                                )
                                external
                                returns (int)
{
    emit contractLog("in creditInsurees",  airlines,  flight,  timestamp,  0,  0);

    return flightSuretyData.creditInsurees(airlines, flight, timestamp, suretyAmtMultiplier, suretyAmtDivider);
}

    function withdraw (
                        address passenger,
                        address airlines,
                        string flight,
                        uint256 timestamp
                    )
                    external
                    returns (uint256)
{
    return flightSuretyData.withdraw( passenger, airlines, flight, timestamp);
}

   /**
    * @dev Called after oracle has updated flight status
    *
    */  
    function processFlightStatus
                                (
                                    address airlines,
                                    string memory flight,
                                    uint256 timestamp,
                                    uint8 statusCode
                                )
                                internal
    {
        emit contractLog("in processFlightStatus1",  airlines,  flight,  timestamp,  statusCode,  0);

        if(statusCode == STATUS_CODE_LATE_AIRLINE){
            uint256 suretyAmtMultiplier = 15;
            uint256 suretyAmtDivider = 10;
            emit contractLog("in processFlightStatus2",  airlines,  flight,  timestamp,  statusCode,  0);

            flightSuretyData.creditInsurees(airlines, flight, timestamp, suretyAmtMultiplier, suretyAmtDivider);
        }
        
    }


    // Generate a request for oracles to fetch flight information
    function fetchFlightStatus
                        (
                            address airline,
                            string  flight,
                            uint256 timestamp                            
                        )
                        external
    {
        uint8 index = getRandomIndex(msg.sender);

        // Generate a unique key for storing the request
        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        oracleResponses[key] = ResponseInfo({
                                                requester: msg.sender,
                                                isOpen: true
                                            });

        emit OracleRequest(index, airline, flight, timestamp);
    } 


// region ORACLE MANAGEMENT

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;    

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;


    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;        
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester;                              // Account that requested status
        bool isOpen;                                    // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses;          // Mapping key is the status code reported
                                                        // This lets us group responses and identify
                                                        // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(address airline, string flight, uint256 timestamp, uint8 status);

    event OracleReport(address airline, string flight, uint256 timestamp, uint8 status);

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(uint8 index, address airline, string flight, uint256 timestamp);


    // Register an oracle with the contract
    function registerOracle
                            (
                            )
                            external
                            payable
    {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        uint8[3] memory indexes = generateIndexes(msg.sender);

        oracles[msg.sender] = Oracle({
                                        isRegistered: true,
                                        indexes: indexes
                                    });
    }

    function getMyIndexes
                            (
                            )
                            view
                            external
                            returns(uint8[3] memory)
    {
        require(oracles[msg.sender].isRegistered, "Not registered as an oracle");

        return oracles[msg.sender].indexes;
    }




    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse
                        (
                            uint8 index,
                            address airline,
                            string  flight,
                            uint256 timestamp,
                            uint8 statusCode
                        )
                        external
    {
        emit contractLog("in submitOracle",  airline,  flight,  timestamp,  statusCode,  index);

        require((oracles[msg.sender].indexes[0] == index) || (oracles[msg.sender].indexes[1] == index) || (oracles[msg.sender].indexes[2] == index), "Index does not match oracle request");

        emit contractLog("in submitOracle2",  airline,  flight,  timestamp,  statusCode,  index);

        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp)); 
        require(oracleResponses[key].isOpen, "Flight or timestamp do not match oracle request");
        emit contractLog("in submitOracle3",  airline,  flight,  timestamp,  statusCode,  index);

        oracleResponses[key].responses[statusCode].push(msg.sender);
        uint8 respLength = uint8(oracleResponses[key].responses[statusCode].length);
        emit contractLog("in submitOracle after push",  msg.sender,  flight,  timestamp,  statusCode,  
        respLength);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(airline, flight, timestamp, statusCode );
        emit contractLog("in submitOracle after oracleRep emit",  airline,  flight,  timestamp,  statusCode,  index);

        if (oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES) 
        {

        emit contractLog("in submitOracle in if cond",  airline,  flight,  timestamp,  statusCode,  index);

            emit FlightStatusInfo(airline, flight, timestamp, statusCode);
            // Handle flight status as appropriate
            processFlightStatus(airline, flight, timestamp, statusCode);
            //cleanup
            delete oracleResponses[key];
        }
    }


    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes
                            (                       
                                address account         
                            )
                            internal
                            returns(uint8[3] memory)
    {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account);
        
        indexes[1] = indexes[0];
        while(indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }

        return indexes;
    }

    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex
                            (
                                address account
                            )
                            internal
                            returns (uint8)
    {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - nonce++), account))) % maxValue);

        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }

// endregion

}   

contract FlightSuretyData 
{
    function isOperational() external  view  returns(bool);
    function setOperatingStatus( bool ) external;
    function registerAirline( string  airlinesName, address newAirlines ) external ;

    function buy(  address passenger, address airlines, string flight, uint256 timestamp) external  payable returns (uint256);
    function getInsuranceAmount(address passenger, address airlines, string flight, uint256 timestamp) external  payable returns (uint256);

    function fund() external payable  returns (uint);
    function getRegisteredAirlineFund(address airline ) external view returns (uint);

    function creditInsurees(address airlines, string flight, uint256 timestamp, uint256 suretyAmtMultiplier, uint256 suretyAmtDivider) external returns (int);
    function getCreditedInsuranceAmount(address passenger, address airlines, string flight, uint256 timestamp) external  payable returns (uint256);
    
    function withdraw ( address passenger, address airlines, string flight, uint256 timestamp) external returns (uint256);
    
}