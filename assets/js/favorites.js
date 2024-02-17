import { GithubUser } from "./github-user.js"

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()
    }

    load() {
        this.entries = JSON.parse(
            localStorage.getItem('@github-favorites:')) || []
    }

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
    }

    async add(username) {
        try {
            const userExistsOnTable = this.entries.find(entry =>
                entry.login.toLowerCase() === username.toLowerCase())

            if (!userExistsOnTable) {
                const user = await GithubUser.searchByUsername(username)

                if (!username) {
                    throw new Error('Precisa digitar algum login do github.')
                }

                if (user.login === undefined) {
                    throw new Error('Usuário não encontrado.')
                }

                this.entries = [user, ...this.entries]
                this.update()
                this.save()

            } else {
                throw new Error('Usuário já existe na lista.')
            }

        } catch (error) {
            alert(error.message)
        }
    }

    delete(user) {
        const filteredEntries = this.entries.filter(entry =>
            entry.login !== user.login
        )

        this.entries = filteredEntries
        this.update()
        this.save()
    }
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)

        this.tbody = this.root.querySelector('table tbody')

        this.update()
        this.onAdd()
    }

    onAdd() {
        const addButton = this.root.querySelector('.search button')
        addButton.onclick = () => {
            const { value } = this.root.querySelector('.search input')
            this.add(value)
        }
    }

    update() {
        this.removeAllTr()

        const entriesLenght = this.entries.length

        if (entriesLenght === 0) {
            const tr = this.createNoEntriesMessageTr()
            this.tbody.append(tr)
        }

        this.entries.forEach(user => {
            const tr = this.createTr()

            user.name = this.replaceEmptyUsernameToUnderscore(user.name)

            tr.querySelector('.user img').src = `https://github.com/${user.login}.png`
            tr.querySelector('.user img').alt = `Imagem do perfil de ${user.name}.`
            tr.querySelector('.user a').href = `https://github.com/${user.login}`
            tr.querySelector('.user p').textContent = `${user.name}`
            tr.querySelector('.user span').textContent = `/${user.login}`
            tr.querySelector('.repositories').textContent = `${user.public_repos}`
            tr.querySelector('.followers').textContent = `${user.followers}`
            tr.querySelector('.actions p').onclick = () => {
                const isOk = confirm("Tem certeza que deseja excluir essa linha?")

                if (isOk) {
                    this.delete(user)
                }
            }

            this.tbody.append(tr)
        })
    }

    createTr() {
        const tr = document.createElement('tr')

        tr.classList.add('row')

        tr.innerHTML = `
            <td class="user">
                <img src="" alt="">
                <a href="" target="_blank">
                    <p></p>
                    <span></span>
                </a>
            </td>
            <td class="repositories"></td>
            <td class="followers"></td>
            <td class="actions">
                <p class="remove">
                    Remover
                </p>
            </td>
        `
        return tr
    }

    createNoEntriesMessageTr() {
        const tr = document.createElement('tr')
        tr.classList.add('row')
        tr.innerHTML = `
            <td class="empty">
                <div>
                    <img src="./assets/img/estrela.svg" alt="Emoji de estrela lamentando">
                    <h2>Nenhum favorito ainda</h2>
                </div>
            </td>
        `
        return tr
    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr')
            .forEach((tr) => {
                tr.remove()
            })
    }

    replaceEmptyUsernameToUnderscore(username) {
        const newUserName = username === null ? "_" : username
        return newUserName
    }

}


