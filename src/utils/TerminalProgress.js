class TerminalProgress {
    constructor(description, bar_length) {
        // the description info
        this.description = description || 'OnProgress';  
        // the render str length
        this.length = bar_length || 50;     
    }

    renderOption(opts) {
        // Calculate progress (completed / total)
        let percent = (opts.completed / opts.total).toFixed(4); 
        // the complete str length
        let cell_num = Math.floor(percent * this.length);

        // complete str
        let complete = '';
        for (let i = 0; i < cell_num; i++) {
            complete += '█';
        }

        // uncompleted str
        let uncomplete = '';
        for (let i = 0; i < this.length - cell_num; i++) {
            uncomplete += '░';
        }
        
        // 
        let progressNum = `${(100 * percent).toFixed(2)}%`

        return {description:this.description,complete,uncomplete,progressNum}
    }
}

module.exports = TerminalProgress;
