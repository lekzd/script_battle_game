import {h} from 'preact';

export const BasicFAQ = () => (
    <div>
        <section>
            <ol class="main">
                <li>
                    <div class="header">
                        Complete squad
                    </div>
                    <div>
                        <video src="/img/select_unit.mov" width="600" autoPlay loop controls />
                    </div>
                    <div>
                        There are three unit classes: magicians, archers and infantry
                    </div>
                </li>
                <li>
                    <div class="header">
                        Type script for your army
                    </div>
                    <div>
                        <video src="/img/run_code.mov" width="600" autoPlay loop controls />
                    </div>
                    <div>
                        It`s a pure JS that performed sequentially for each unit
                    </div>
                </li>
                <li>
                    <div class="header">
                        Press "Ready!"
                    </div>
                    <div>
                        <img src="/img/tuttorial_send.png" alt="" width="100" />
                    </div>
                    <div>
                        The battle between players starts in case of two players become ready
                    </div>
                </li>
            </ol>
        </section>

        <section>
            <ul>
                <li>Turn sequence depends on unit speed value, fastest gone first</li>
                <li>Winner will chosen after all enemies is killed or by points after the end of the code</li>
            </ul>
        </section>
    </div>
)


