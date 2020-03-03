Vue.component('card', {
    template: '#card-template',
    props: ['applicant', 'selectedSkills'],
    data() {
        return {
            show: false
        }
    }
});

new Vue({
    el: '#app',
    vuetify: new Vuetify(),
    data: {
        applicants: [],
        drawer: true,
        profession: [],
        location: [],
        site: ['moikrug.ru'],
        skills: [],
        professionItems: ['Разработчик', 'Программист', 'Консультант', 'Developer', 'Инженер', 'Архитектор'],
        locationItems: ['Москва', 'Санкт-Петербург'],
        siteItems: ['moikrug.ru'],
        skillItems: ['Sharepoint', 'HTML', 'CSS', 'JavaScript', 'C#', 'ASP.NET'],
    },
    methods: {
        async searchApplicants() {
            let request = {
                profession: this.profession,
                location: this.location,
                site: this.site,
                skills: this.skills,
            };

            let response = await axios.post('/api/search', request);
            if (response.data.error) {
                console.log(response.data.error);
                return ;
            }

            this.applicants = response.data;

            if (!this.isPermanent) {
                this.drawer = false;
            }
        },
    },
    computed: {
        isPermanent() {
            return this.$vuetify.breakpoint.mdAndUp;
        }
    }
});