import * as React from "react";
import { Box, Button, Divider, Grid, Typography, Link } from "@mui/material";

import { useInput } from "@/hooks/useInput";
import { useContractKit } from "@celo-tools/use-contractkit";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { truncateAddress } from "@/utils";
import { Greeter } from "../../hardhat/types/Greeter";
import { CarbonCredit } from "../../hardhat/types/CarbonCredit";

export function CarbonCreditContract({ contractData }) {
  const { kit, address, network, performActions } = useContractKit();
  const [length, setLength] = useState<string | null>(null);
  const [hash, setHash] = useInput({ type: "string" });
  const [carbonCreditInput, setCarbonCreditInput] = useInput({ type: "text" });
  const [retireValue, setRetireValue] = useInput({ type: "number" });
  const [contractLink, setContractLink] = useState<string>("");
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const contract = contractData
    ? (new kit.web3.eth.Contract(
        contractData.abi,
        contractData.address
      ) as any as CarbonCredit)
    : null;

  useEffect(() => {
    if (contractData) {
      setContractLink(`${network.explorer}/address/${contractData.address}`);
    }
  }, [network, contractData]);

  const depositCarbonCreditsFromCertificate = async () => {
    try {
      await performActions(async (kit) => {
        const gasLimit = await contract.methods
          .depositCarbonCreditsFromCertificate(carbonCreditInput as string, hash as string)
          .estimateGas();

        const result = await contract.methods
          .depositCarbonCreditsFromCertificate(carbonCreditInput as string, hash as string)
          //@ts-ignore
          .send({ from: address, gasLimit });

        console.log(result);

        const variant = result.status == true ? "success" : "error";
        const url = `${network.explorer}/tx/${result.transactionHash}`;
        const action = (key) => (
          <>
            <Link href={url} target="_blank">
              View in Explorer
            </Link>
            <Button
              onClick={() => {
                closeSnackbar(key);
              }}
            >
              X
            </Button>
          </>
        );
        enqueueSnackbar("Transaction processed", {
          variant,
          action,
        });
      });
    } catch (e) {
      enqueueSnackbar(e.message, {variant: 'error'});
      console.log(e);
    }
  };

  const retire = async () => {
    try {
      await performActions(async (kit) => {
        const gasLimit = await contract.methods
          .retire(retireValue as string)
          .estimateGas();

        const result = await contract.methods
          .retire(retireValue as string)
          //@ts-ignore
          .send({ from: address, gasLimit });

        console.log(result);

        const variant = result.status == true ? "success" : "error";
        const url = `${network.explorer}/tx/${result.transactionHash}`;
        const action = (key) => (
          <>
            <Link href={url} target="_blank">
              View in Explorer
            </Link>
            <Button
              onClick={() => {
                closeSnackbar(key);
              }}
            >
              X
            </Button>
          </>
        );
        enqueueSnackbar("Transaction processed", {
          variant,
          action,
        });
      });
    } catch (e) {
      enqueueSnackbar(e.message, {variant: 'error'});
      console.log(e);
    }
  };

  const getCarbonCertificatesLength = async () => {
    try {
      const result = await contract.methods.carbonCertificatesLength().call();
      setLength(result);
    } catch (e) {
      console.log(e);
    }
  };


  return (
    <Grid sx={{ m: 1 }} container justifyContent="center">
      <Grid item sm={6} xs={12} sx={{ m: 2 }}>
        <Typography variant="h5">Carbon Contract</Typography>
        {contractData ? (
          <Link href={contractLink} target="_blank">
            {truncateAddress(contractData?.address)}
          </Link>
        ) : (
          <Typography>No contract detected for {network.name}</Typography>
        )}
        <Divider sx={{ m: 1 }} />

        <Typography variant="h6">Deposit Carbon Credit from Certificate</Typography>
        <div>
          <div style={{ display: 'inline-block' }}><Typography>value:&nbsp;&nbsp;</Typography></div>
          <Box sx={{ display: 'inline-block', m: 1, marginLeft: 0 }}>{setCarbonCreditInput}</Box>
        </div>
        <div>
          <div style={{ display: 'inline-block' }}><Typography>hash:&nbsp;&nbsp;</Typography></div>
          <Box sx={{ display: 'inline-block', m: 1, marginLeft: 0 }}>{setHash}</Box>
        </div>
        <Button sx={{ m: 1, marginLeft: 0 }} variant="contained" onClick={depositCarbonCreditsFromCertificate}>
          Deposit
        </Button>
        <Divider sx={{ m: 1 }} />

        <Typography variant="h6">Retire</Typography>
        <Box sx={{ m: 1, marginLeft: 0 }}>{setRetireValue}</Box>
        <Button sx={{ m: 1, marginLeft: 0 }} variant="contained" onClick={retire}>
          Retire
        </Button>

        <Typography variant="h6">Read Contract</Typography>
        <Typography sx={{ m: 1, marginLeft: 0, wordWrap: "break-word" }}>
          Carbon Certificates Length: {length}
        </Typography>
        <Button sx={{ m: 1, marginLeft: 0 }} variant="contained" onClick={getCarbonCertificatesLength}>
          Get Length
        </Button>
      </Grid>
    </Grid>
  );
}
