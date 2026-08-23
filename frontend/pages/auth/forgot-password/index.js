function ForgotPasswordRedirect() {
  return null;
}

export function getServerSideProps() {
  return {
    redirect: {
      destination: '/auth/login?forgot=1',
      permanent: false
    }
  };
}

export default ForgotPasswordRedirect;
