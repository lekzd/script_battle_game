import {h} from 'preact';

export const HowCodeWorks = () => (
    <div>
        <section>
            <ol>
                <li class="mb-10">All code performs 1 time BEFORE battle starts</li>
                <li class="mb-10">Similar code performs for each unit of the battle side</li>
                <li>After that units will go using generated script</li>
            </ol>
            <section>
                <p>Make fork conditions to make different code for units</p>
            </section>

            <div className="signature">
                <div className="mb-20">
                    You can use IDs:
                </div>
                <div class="flex-row flex-align-center mb-20">
                    <div>
<pre>
{`if (is('CSS')) {
    ...
}`}
</pre>
                    </div>
                    <div className="ml-auto">
                        <img src="/img/$_unit.png" style="opacity: .3" height="80" alt=""/>
                        <img src="/img/css_unit.png" style="border: 1px solid" height="80" className="ml-20" alt=""/>
                        <img src="/img/pwa_unit.png" style="opacity: .3" height="80" className="ml-20" alt=""/>
                    </div>
                </div>
            </div>

            <div className="signature">
                <div className="mb-20">
                    Or unit class:
                </div>
                <div class="flex-row flex-align-center mb-20">
                    <div>
<pre>
{`if (isShooter()) {
    ...
}`}
</pre>
                    </div>
                    <div className="ml-auto">
                        <img src="/img/$_unit.png" style="border: 1px solid" height="80" alt=""/>
                        <img src="/img/css_unit.png" style="opacity: .3" height="80" className="ml-20" alt=""/>
                        <img src="/img/pwa_unit.png" style="border: 1px solid" height="80" className="ml-20" alt=""/>
                    </div>
                </div>
            </div>
        </section>
    </div>
)