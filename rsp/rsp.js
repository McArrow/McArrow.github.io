(function ($) {
    'use strict';

    let interval;

    function run() {
        if (interval) {
            return;
        }

        let stepNo = 0;

        const array = [];
        const typeR = 'r';
        const typeS = 's';
        const typeP = 'p';
        const types = [typeR, typeS, typeP];
        const count = parseInt($('#qty').val()) * types.length;
        const radius = parseInt($('#radius').val());
        const containerSize = parseInt($('#containerSize').val());
        const container = $('#container')
            .css({width: (containerSize + 2 * radius) + 'px', height: (containerSize + 2 * radius) + 'px'});
        const dt = parseFloat($('#dt').val());
        const coeff = 10000;
        const attractionToRepulsion = parseFloat($('#attractionToRepulsion').val());

        container.html('');

        for (let i = 0; i < count; i++) {
            let type = types[i % types.length];
            let image = $('<img src="' + type + '.png" width="' + (2 * radius) + '" height="' + (2 * radius) + '" alt="" />')
                .css({position: 'absolute'});
            array.push({
                type,
                x: containerSize * Math.random(),
                y: containerSize * Math.random(),
                vx: 0,
                vy: 0,
                ax: 0,
                ay: 0,
                element: image
            });
            container.append(image);
        }

        interval = window.setInterval(function () {
            draw();
            step();
            stepNo++;
            $('#stepCounter').html(stepNo);
        }, 50);

        function draw() {
            for (let i = 0; i < count; i++) {
                let o = array[i];
                o.element.css({
                    left: o.x,
                    top: o.y
                });
                o.element.prop('src', o.type + '.png');
            }
        }

        function step() {
            // проверяем касания
            for (let i = 0; i < count; i++) {
                for (let j = 0; j < count; j++) {
                    if (i !== j) {
                        let distance = Math.sqrt(Math.pow(array[i].x - array[j].x, 2) + Math.pow(array[i].y - array[j].y, 2));
                        if (distance <= 2 * radius) {
                            if (array[i].type === typeR && array[j].type === typeP) {
                                array[i].type = typeP;
                            } else if (array[i].type === typeS && array[j].type === typeR) {
                                array[i].type = typeR;
                            } else if (array[i].type === typeP && array[j].type === typeS) {
                                array[i].type = typeS;
                            }
                        }
                    }
                }
            }

            for (let i = 0; i < count; i++) {
                // сопротивление среды
                array[i].ax = -array[i].vx * 0.5;
                array[i].ay = -array[i].vy * 0.5;

                // рассчитываем ускорение
                for (let j = 0; j < count; j++) {
                    if (i !== j && array[i].type !== array[j].type) {
                        let distance2 = Math.pow(array[i].x - array[j].x, 2) + Math.pow(array[i].y - array[j].y, 2);
                        let distance = Math.sqrt(distance2);

                        let cos = (array[j].x - array[i].x) / distance;
                        let sin = (array[j].y - array[i].y) / distance;

                        let force = coeff / distance2;

                        let sign = 1;
                        if (array[i].type === typeR && array[j].type === typeP
                            || array[i].type === typeS && array[j].type === typeR
                            || array[i].type === typeP && array[j].type === typeS
                        ) {
                            sign = -1 / attractionToRepulsion;
                        }

                        array[i].ax += sign * cos * force;
                        array[i].ay += sign * sin * force;
                    }
                }
            }

            for (let i = 0; i < count; i++) {
                array[i].vx += array[i].ax * dt;
                array[i].vy += array[i].ay * dt;

                // Ограничение скорости
                array[i].vx = Math.sign(array[i].vx) * Math.min(Math.abs(array[i].vx), 0.1 * containerSize * dt);
                array[i].vy = Math.sign(array[i].vy) * Math.min(Math.abs(array[i].vy), 0.1 * containerSize * dt);

                array[i].x += array[i].vx * dt;
                array[i].y += array[i].vy * dt;

                // Отражение от стенок
                array[i].x = Math.abs(array[i].x);
                array[i].y = Math.abs(array[i].y);

                if (array[i].x > containerSize) {
                    array[i].x = 2 * containerSize - array[i].x;
                }
                if (array[i].y > containerSize) {
                    array[i].y = 2 * containerSize - array[i].y;
                }

            }
        }
    }

    $(function () {
        $('#button').on('click', function () {
            if (interval) {
                $('input[type=number]').prop('disabled', false);
                window.clearInterval(interval);
                interval = null;
                $('#button').val('Старт');
                $('#stepCounter').html('');
            } else {
                run();
                $('input[type=number]').prop('disabled', true);
                $('#button').val('Стоп');
            }
        });

        run();
    });
})(jQuery);
