document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('sitesTable').getElementsByTagName('tbody')[0];

    fetch('/routes')
        .then(response => response.json())
        .then(data => {
            const sites = Array.isArray(data) ? data : (data.items || []);
            
            sites.forEach(site => {
                const accessibilityScore = site.accessibilityScore || 'Not Available';
                const a = site.a || 'Not Available';
                const aa = site.aa || 'Not Available';
                const aaa = site.aaa || 'Not Available';
                const aria = site.aria || 'Not Available';
                const date = site.date || 'Not Available'; 

                let row = `<tr>
                            <td>${site.id}</td>
                            <td>${site.site_name}</td>
                            <td><a href="${site.url}" target="_blank">${site.url}</a></td>
                            <td>${a}</td>
                            <td>${aa}</td>
                            <td>${aaa}</td>
                            <td>${aria}</td>
                            <td>${accessibilityScore}%</td>
                            <td>${date}</td>
                           </tr>`;
                tableBody.innerHTML += row;
            });
        })
        .catch(error => {
            console.error('Error fetching sites data:', error);
            // Optionally, handle errors by showing a message in the UI
        });
});
