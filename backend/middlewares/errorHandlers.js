function handleError(err, res) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
}

function notFoundHandler(req, res) {
    res.status(404).json({ error: 'Not found' });
}

module.exports = {
    handleError,
    notFoundHandler,
};
