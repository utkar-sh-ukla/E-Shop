import React,{useState, useEffect} from 'react'
import {Paper, Stepper, Step, StepLabel, Button, Typography, CircularProgress, Divider, CssBaseline} from '@material-ui/core'
import { Link , useHistory} from 'react-router-dom'

import {commerce} from '../../../lib/commerce'
import useStyles from './styles'
import AddressForm from '../AddressForm'
import PaymentForm from '../PaymentForm'

const steps = ['Shipping address', 'Payment details']

const Checkout = ({ cart, onCaptureCheckout, order, error }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [checkoutToken, setCheckoutToken] = useState(null);
  const [shippingData, setShippingData] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const classes = useStyles();
  const history = useHistory();

  const nextStep = () => setActiveStep((prevActiveStep) => prevActiveStep + 1);

  const backStep = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);

  const timeout = () => {
    setTimeout(() => {
      setIsFinished(true);
    }, 3000);
  }

  useEffect(() => {
    if (cart.id) {
      const generateToken = async () => {
        try {
          const token = await commerce.checkout.generateToken(cart.id, {
            type: 'cart',
          });

          setCheckoutToken(token);
        } catch {
          if (activeStep !== steps.length) history.push('/');
        }
      };

      generateToken();
    }
  }, [cart]);

  const next = (data) => {
    setShippingData(data);
    nextStep();
  };

    let Confirmation = () =>
      order.customer ? (
        <>
          <div>
            <Typography variant='h5'>
              Thank you for your purchase, {order.customer.firstname}{' '}
              {order.customer.lastname}!
            </Typography>
            <Divider className={classes.divider} />
            <Typography variant='subtitle2'>
              Order ref: {order.customer_reference}
            </Typography>
          </div>
          <br />
          <Button component={Link} variant='outlined' type='button' to='/'>
            Back to home
          </Button>
        </>
      ) : isFinished ? (
        <>
          <div>
            <Typography variant='h5'>
              Thank you for your purchase
            </Typography>
            <Divider className={classes.divider} />
          </div>
          <br />
          <Button component={Link} variant='outlined' type='button' to='/'>
            Back to home
          </Button>
        </>
      ):(
        <div className={classes.spinner}>
          <CircularProgress />
        </div>
      )

    if (error) {
      Confirmation = () => (
        <>
          <Typography variant='h5'>Error: {error}</Typography>
          <br />
          <Button component={Link} variant='outlined' type='button' to='/'>
            Back to home
          </Button>
        </>
      );
    }

  const Form = () =>
    activeStep === 0 ? (
      <AddressForm
        checkoutToken={checkoutToken}
        next={next}
        setShippingData={setShippingData}
        nextStep={nextStep}
      />
    ) : (
      <PaymentForm
        checkoutToken={checkoutToken}
        nextStep={nextStep}
        backStep={backStep}
        shippingData={shippingData}
        onCaptureCheckout={onCaptureCheckout}
        timeout={timeout}
      />
    );
  return (
    <>
      <div className={classes.toolbar} />
      <main className={classes.layout}>
        <Paper className={classes.paper}>
          <Typography variant='h4' className={classes.stepper}>
            Checkout
          </Typography>
          <Stepper activeStep={activeStep} className={classes.stepper}>
            {steps.map((step) => (
              <Step key={step}>
                <StepLabel>{step}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length ? (
            <Confirmation />
          ) : (
            checkoutToken && <Form />
          )}
        </Paper>
      </main>
    </>
  );
};

export default Checkout
