function resolveErrorMessage(err) {
  if (err?.parent?.sqlMessage) {
    return err.parent.sqlMessage;
  }
  if (err?.original?.message) {
    return err.original.message;
  }
  if (typeof err?.message === 'string' && err.message.trim()) {
    return err.message;
  }
  return 'Internal Server Error';
}

const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = resolveErrorMessage(err);

  if (process.env.NODE_ENV !== 'production') {
    console.error('[API]', req.method, req.path, err.name || 'Error', message);
    if (err.stack) {
      console.error(err.stack);
    }
  }

  res.status(status).json({
    status: 'error',
    message,
    data: null,
  });
};

module.exports = errorHandler;
