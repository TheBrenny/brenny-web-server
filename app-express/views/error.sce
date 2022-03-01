[[i= partials/header ]]

<div class="errorWrapper">
    <div id="error">
        <h1>[[error.code]] - [[error.name]]</h1>
        <p>[[error.message]]</p>
        [[?= error.stack ]]
        <div class="preWrap">
            <pre>[[error.stack]]</pre>
        </div>
        [[?==]]
    </div>
    <a href="/" class="btn">Home</a>
</div>

[[i= partials/footer]]