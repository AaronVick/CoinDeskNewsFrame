function Error({ statusCode, err }) {
    console.error('Error details:', err);
    return (
      <div>
        <h1>Error {statusCode}</h1>
        <p>{err?.message || 'An unexpected error occurred'}</p>
        {process.env.NODE_ENV !== 'production' && (
          <details>
            <summary>Error Details</summary>
            <pre>{JSON.stringify(err, null, 2)}</pre>
          </details>
        )}
      </div>
    );
  }
  
  Error.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode, err };
  };
  
  export default Error;