const apiUrl = 'https://api.github.com/users/';

function getRepositories() {
    const username = $('#username').val();
    const perPage = 10;
    const maxPerPage = 100;

    $('#loader').removeClass('d-none');

    $.ajax({
        url: `${apiUrl}${username}/repos?per_page=${perPage}`,
        method: 'GET',
        success: function (data, textStatus, xhr) {
            if (data.length === 0) {
                displayErrorMessage('User has no public repositories.');
            } else {
                displayRepositories(data);

                const linkHeader = xhr.getResponseHeader('Link');
                if (linkHeader) {
                    const links = parseLinkHeader(linkHeader);
                    displayPagination(links, maxPerPage);
                } else {
                    $('#pagination').empty();
                }
            }

            $('#loader').addClass('d-none');
        },
        error: function (error) {
            console.error('Error fetching repositories:', error);

            if (error.status === 404) {
                displayErrorMessage('User not found or has no public repositories.');
            } else if (error.status === 403 && error.responseJSON && error.responseJSON.message.includes('API rate limit exceeded')) {
                displayErrorMessage('API rate limit exceeded. Please try again later.');
            } else {
                displayErrorMessage('Error fetching repositories. Please try again later.');
            }

            $('#loader').addClass('d-none');
        }
    });
}

function displayRepositories(repositories) {
    const repositoriesContainer = $('#repositories');
    repositoriesContainer.empty();

    repositories.forEach(repo => {
        repositoriesContainer.append(`
            <div class="col-md-4 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${repo.name}</h5>
                        <p class="card-text">${repo.description || 'No description available'}</p>
                        <span class="badge badge-secondary">${repo.language || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `);
    });
}

function displayPagination(links, maxPerPage) {
    const paginationContainer = $('#pagination');
    paginationContainer.empty();

    const pageCount = Math.ceil(links.last / maxPerPage);

    for (let i = 1; i <= pageCount; i++) {
        const listItem = $('<li class="page-item">');
        const pageLink = $('<a class="page-link">').text(i).on('click', function () {
            changePage(i);
        });

        listItem.append(pageLink);
        paginationContainer.append(listItem);
    }
}

function changePage(pageNumber) {
    const username = $('#username').val();
    const maxPerPage = 100;

    $('#loader').removeClass('d-none');

    $.ajax({
        url: `${apiUrl}${username}/repos?per_page=${maxPerPage}&page=${pageNumber}`,
        method: 'GET',
        success: function (data, textStatus, xhr) {
            displayRepositories(data);

            const linkHeader = xhr.getResponseHeader('Link');
            if (linkHeader) {
                const links = parseLinkHeader(linkHeader);
                displayPagination(links, maxPerPage);
            } else {
                $('#pagination').empty();
            }

            $('#loader').addClass('d-none');
        },
        error: function (error) {
            console.error('Error fetching repositories:', error);
            $('#loader').addClass('d-none');
        }
    });
}

function parseLinkHeader(linkHeader) {
    const links = linkHeader.split(',');
    const linkInfo = {};

    links.forEach(link => {
        const [url, rel] = link.split(';');
        const cleanUrl = url.trim().slice(1, -1);
        const cleanRel = rel.trim().split('=')[1].slice(1, -1);
        linkInfo[cleanRel] = cleanUrl;
    });

    return linkInfo;
}


function displayErrorMessage(message) {
    const repositoriesContainer = $('#repositories');
    repositoriesContainer.empty();
    repositoriesContainer.append(`<div class="col-md-12"><p class="text-danger">${message}</p></div>`);
}

