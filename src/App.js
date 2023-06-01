import "./App.css";

import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import {
  Box,
  Button,
  Flex,
  Image,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  Stack,
  Text,
} from "@chakra-ui/react";
import Emoji from "react-emojis";

import messi from "./messi.jpg";
import axios from "axios";

import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB0SCJVkhStk7EbNJIPAelpLUI1TjAJrRE",
  authDomain: "support-messi.firebaseapp.com",
  projectId: "support-messi",
  storageBucket: "support-messi.appspot.com",
  messagingSenderId: "614474825812",
  appId: "1:614474825812:web:48a88f73e6de0db6bd6dc1",
  measurementId: "G-L8WTP2122H",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

function App() {
  const [customValue, setCustomValue] = useState(10);
  const [value, setValue] = useState("1");

  const [isApproved, setIsApproved] = useState(false);
  const [payedAmount, setPayedAmount] = useState(0);

  console.log("base ur", process.env.REACT_APP_BASE_URL);

  return (
    <Flex>
      <Box
        pos="absolute"
        w="100vw"
        h="100vh"
        top="0"
        left="0"
        backgroundColor={"rgba(0,0,0,0.3)"}
      />
      <Flex
        background={"linear-gradient(#a50044, #004d98)"}
        height={"100vh"}
        w="100vw"
        align={"center"}
        justify={"center"}
        color="white"
        flexDir={"column"}
      >
        <Box zIndex={100} p="8" borderRadius={"xl"}>
          {isApproved ? (
            <Flex flexDir={"column"} justify={"center"}>
              <Text fontSize={"5xl"}>Lo queremos de vuelta!</Text>
              <Text>
                Los culé pagaron{" "}
                <span style={{ fontSize: 20 }}>{payedAmount} USD</span> porque
                quieren a Messi de vuelta en casa!
              </Text>
              <Button
                margin={"auto"}
                mt="5"
                color="blue"
                onClick={() => {
                  setIsApproved(false);
                }}
              >
                Vuelve a revisar!
              </Button>
            </Flex>
          ) : (
            <Flex gap="4">
              <Image
                src={messi}
                borderRadius={"3xl"}
                display={["none", "none", "none", "block"]}
                alignSelf={"center"}
              />
              <Flex
                flexDir={"column"}
                justify={"space-between"}
                align={"center"}
                gap="4"
              >
                <Flex
                  maxW={"800px"}
                  justify={"center"}
                  align="center"
                  flexDir={"column"}
                >
                  <Text fontSize={"5xl"}>Los culé lo queremos en su casa!</Text>
                  <Text>
                    Se comenta que Messi puede volver a vestir la camiseta del
                    Barcelona.
                  </Text>
                  <Text>
                    Tienes las mismas ganas que nosotros de verlo de vuelta en
                    su casa?
                  </Text>
                  <Text fontSize={"lg"} fontWeight={"bold"} align="center">
                    Cuentános cuánto y te mostraremos que piensa la gente!
                  </Text>
                </Flex>
                <RadioGroup defaultValue={value} onChange={setValue} mb="4">
                  <Stack spacing={5} direction="column">
                    <Radio colorScheme="red" value={"1"}>
                      <Flex align={"center"} gap="2">
                        <Emoji emoji="trophy" />
                        <Text>1 USD (Lo quiero de vuelta)</Text>
                      </Flex>
                    </Radio>
                    <Radio colorScheme="blue" value={"5"}>
                      <Flex align={"center"} gap="2">
                        <Emoji emoji="trophy" />
                        <Emoji emoji="trophy" />
                        <Text>5 USD (Que vuelva ayer!)</Text>
                      </Flex>
                    </Radio>
                    <Radio colorScheme="red" value={"0"}>
                      <Flex align={"center"} gap="2">
                        <Emoji emoji="trophy" />
                        <Emoji emoji="trophy" />
                        <Emoji emoji="trophy" />
                        <Text>Que tanto quieres? (USD)</Text>
                      </Flex>
                    </Radio>
                    {!Number(value) && (
                      <NumberInput min={10}>
                        <NumberInputField
                          onChange={(e) => setCustomValue(e.target.value)}
                          value={customValue}
                          setValue={setCustomValue}
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    )}
                  </Stack>
                </RadioGroup>
                <PayPalScriptProvider
                  options={{
                    "client-id":
                      "AeFCUSb6YbuLZvPee8NqFhMjAPsdEHjUVf0oTUHWVEufHirNUK-VJZRycYPuefO_gwoixLoqkRM_1nRh",
                  }}
                >
                  <PayPalButtons
                    onClick={() => {
                      logEvent(analytics, "begin_checkout", {
                        value: Number(value) || customValue,
                      });
                    }}
                    disabled={false}
                    forceReRender={[Number(value) || customValue]}
                    fundingSource="paypal"
                    createOrder={(data, actions) => {
                      return actions.order
                        .create({
                          application_context: {
                            shipping_preference: "NO_SHIPPING",
                          },
                          purchase_units: [
                            {
                              amount: {
                                currency_code: "USD",
                                value: Number(value) || customValue,
                              },
                            },
                          ],
                        })
                        .then((orderId) => {
                          console.log("y", orderId);
                          // Your code here after create the order
                          return orderId;
                        });
                    }}
                    onApprove={function (data, actions) {
                      logEvent(analytics, "purchase");

                      return actions.order.get().then(function () {
                        console.log("base ur", process.env.REACT_APP_BASE_URL);
                        axios
                          .post(
                            `${process.env.REACT_APP_BASE_URL}/capture-paypal-order`,
                            {
                              orderID: data.orderID,
                            }
                          )
                          .then((response) => {
                            setPayedAmount(response.data);
                            setIsApproved(true);
                          })
                          .catch((error) =>
                            console.log("response error", error)
                          );
                      });
                    }}
                  />
                </PayPalScriptProvider>
              </Flex>
            </Flex>
          )}
        </Box>
      </Flex>
    </Flex>
  );
}

export default App;
