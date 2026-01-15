
fetch('http://localhost:3001/api/admin/seed', { method: 'POST' })
    .then(res => res.json())
    .then(json => {
        console.log('Seed response:', json)
        return fetch('http://localhost:3001/api/store/settings')
    })
    .then(res => res.json())
    .then(json => console.log('Settings response:', json))
    .catch(console.error)
