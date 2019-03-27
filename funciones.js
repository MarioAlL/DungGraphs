$(document).ready(function() {
    document.getElementById("mynetworkDeLP").style.height = Math.round($(window).height() * 0.60) + 'px';
    var exampleJSON = '{"arguments":["A","B","C","D","E","F"],"attacks":["(A,B)","(A,C)","(B,C)","(E,D)","(E,F)","(F,A)","(F,E)","(A,E)"]}';

  var network;
  var dataForExtensions;
  // create an array with nodes
  var nodes = new vis.DataSet([]);

  // create an array with edges
  var edges = new vis.DataSet([]);

  // create a network
  var container = document.getElementById('mynetworkDeLP');
  var data = {
    nodes: nodes,
    edges: edges
  };

  var options = {
    interaction: {
      hover: true
    },
    manipulation: {
      addNode: function(nodeData, callback) {
        $("#nodeLabel").focus();
        nodeData.id = $("#nodeLabel").val();
        nodeData.label = $("#nodeLabel").val();
        $("#nodeLabel").val("");
        callback(nodeData);
      },
      addEdge: function(edgeData, callback) {

        edgeData.arrows = "to";
        $("#semantics").prop('disabled', false);
        callback(edgeData);
      }
    }
  };

  network = new vis.Network(container, data, options);
  dataForExtensions = data;
    graficarJson(JSON.parse(exampleJSON));
    console.log("---> OK");


  $("#semantics").change(function() {
    //showPleaseWait();
    var jsonNodos = network.body.data.nodes._data;
    var jsonRelaciones = network.body.data.edges._data;

    var nodos = [];
    var ataques = [];

    var dataNodos = [];
    var dataEdges = [];

    $.each(jsonNodos, function(key, value) {
      nodos.push(key);
      dataNodos.push({
        'id': key,
        'label': key
      });
    });

    //console.log("Nodos: " + nodos);

    $.each(jsonRelaciones, function(key, value) {
      ataques.push('(' + value.from + "," + value.to + ')');
      dataEdges.push({
        'from': value.from,
        'to': value.to,
        'arrows': 'to'
      });
    });

    //console.log("Ataques: " + ataques);

    //Se grafica el dung donde se mostraran las extensiones
    adaptarVistas(); //Para mostrar el div donde se dibuja las extensiones;
      network.redraw();
    graficarDungExtensiones(dataNodos, dataEdges);
    $("#selectExtensionsResults").html('');

    /////Call to solver
    $.ajax({
      url: 'callSolver.php',
      method: 'POST',
      data: {
        arguments: nodos,
        attacks: ataques,
        semantics: $(this).val(),
        solver: $("input[name='solver']:checked").val()
      },
      success: function(data) {

        console.log("Extension: " + data);
        result = JSON.parse(data);

        loadExtensionResult(Object.values(result)[0]);
        document.getElementById("extensions").style.display="block";
        //hidePleaseWait();
        
      },
      error: function(error) {
        alert("error: " + JSON.stringify(error));
        //hidePleaseWait();
      }
    });


  });
  /////Change para cada extension
  $('#selectExtensionsResults').change(function() {

    var result = $(this).val();
    //console.log(result);
    cleanNetwork();
    extensiones(result);
  });

  function adaptarVistas() {
    $("#divForJsonInput").css("display", "none");
    $("#containerOfDung").removeClass("col-sm-12 col-md-12");
    $("#containerOfDung").addClass("col-sm-6 col-md-6");
    $("#containerOfExtensions").css("display", "block");
    document.getElementById("mynetworkDeLPExtensions").style.height = Math.round($(window).height() * 0.70) + 'px';
      document.getElementById("mynetworkDeLP").style.height = Math.round($(window).height() * 0.70) + 'px';
  }

  function cleanNetwork() {

    $.each(dataForExtensions.nodes._data, function(key, value) {
      dataForExtensions.nodes.update([{
        id: key,
        color: '#97C2FC'
      }])
    });

  }

  function extensiones(extensiones) {

    var nodos = extensiones.split(',');

    for (var i = 0; i < nodos.length; i++) {
      dataForExtensions.nodes.update([{
        id: nodos[i],
        color: '#82e0aa'
      }]);
    }
  }

  function loadExtensionResult(extensiones) {

    for (var i = 0; i < extensiones.length; i++) {
      if (Array.isArray(extensiones[i])) {
        //Una extension (un array)
        $("#selectExtensionsResults").append($("<option />").val(extensiones[i]).text(extensiones[i]));
      } else {
        //Nodo que forma parte de la extension (el resultado es un conjunto de nodos)
        $("#selectExtensionsResults").append($("<option />").val(extensiones).text(extensiones));
        break;
      }
    }
    $('#selectExtensionsResults option').eq(0).prop('selected', true).trigger('change');
  }


  function graficarDungExtensiones(nodos, edges) {

    var nodosLocal = new vis.DataSet(nodos);
    var edgesLocal = new vis.DataSet(edges);
    var dataLocal = {
      nodes: nodosLocal,
      edges: edgesLocal
    };
    var options = {};
    dataForExtensions = dataLocal;
    var extensionsNetwork = new vis.Network(document.getElementById("mynetworkDeLPExtensions"), dataForExtensions, options);
  }

  function showPleaseWait() {
    /*var modalLoading = '<div class="modal" id="pleaseWaitDialog" data-backdrop="static" data-keyboard="false role="dialog">\
        <div class="modal-dialog">\
            <div class="modal-content">\
                <div class="modal-header">\
                    <h4 class="modal-title">Calculating extensions ......</h4>\
                </div>\
                <div class="modal-body">\
                    <div class="progress">\
                      <div class="progress-bar progress-bar-success progress-bar-striped active" role="progressbar"\
                      aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width:100%; height: 40px">\
                      </div>\
                    </div>\
                </div>\
            </div>\
        </div>\
    </div>';
    $(document.body).append(modalLoading);*/
    $("#pleaseWaitDialog").modal("show");
  }

  /**
   * Hides "Please wait" overlay. See function showPleaseWait().
   */
  function hidePleaseWait() {
    $("#pleaseWaitDialog").modal("hide");
  }

  $("#file").change(function() {
    var content = new FileReader();
    
    
   
      var file = this.files[0];
      
      content.readAsText(file);
      content.onload = function(event) {
      var dungJson = JSON.parse(event.target.result);
      
        if (dungJson.arguments) {
          if (dungJson.attacks) {
            //console.log("Ok json");
            graficarJson(dungJson);

          } else {
            alert("File error: no attacks specified");
          }
        } else {
          alert("File error: no arguments specified");
        }
      

    };
      
      
    
    


    
    
  });

function graficarJson(dungJson){

  
  //console.log("Arguments: " + dungJson.arguments);
  //console.log("Attacks: " + dungJson.attacks);
  

  var container = document.getElementById('mynetworkDeLP');

  var nodos = [];
  var edgesLocal = [];
  var aux;
try{
  $.each(dungJson.arguments, function(key, value){
    nodos.push({
      'id':value,
      'label':value
    });
  });

  $.each(dungJson.attacks, function(key, value){
    aux = value.split(",");
    edgesLocal.push({
      'from':aux[0].substr(1, aux[0].length),
      'to':aux[1].substr(0, aux[1].length - 1),
      'arrows':'to'
    })
  });
}catch(err){
  alert("File error");
}
  

  nodes.update(nodos);
  edges.update(edgesLocal);
  $("#semantics").prop('disabled', false);
  

};


});